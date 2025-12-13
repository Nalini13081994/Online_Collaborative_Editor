

import { AfterViewInit, Component, OnInit, ViewChild, ElementRef, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConverterService } from '../services/converter.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
//** Code Mirror v6 imports */
import { java } from '@codemirror/lang-java';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { EditorState, Extension, StateEffect } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { autocompletion, CompletionContext, completionKeymap} from '@codemirror/autocomplete';

//* Collaboration Imports **/
import * as Y from 'yjs';
import { yCollab } from 'y-codemirror.next';
import { WebsocketProvider } from 'y-websocket'
import { ChangeDetectorRef } from '@angular/core';





@Component({
  selector: 'app-editor-page',
  templateUrl: './editor-page.html',
  styleUrl: './editor-page.css',
  standalone: true,
  imports: [FormsModule, HttpClientModule]
})


export class EditorPage implements  AfterViewInit, OnInit, OnDestroy{

  
  private static inits: Set<string> = new Set<string>(); 
  title: string = "Collaborative Code Editor with AI"
  convertedCode = '';
  default_code:string =`// Welcome to the Collaborative Code Editor!
// Start coding in Java

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
    
}`
   userId: string = 'loading...';
  isConnected: boolean = false;
  isBrowser: boolean = false;
  private initDone = false;

  // ** COLLABORATION PROPERTIES **
  activeUsersCount: number = 1; 
    activeUsers: Array<any> = [];
  roomName: string = 'angular-collab-demo-room'; // Shared room name
  private ydoc!: Y.Doc;
  private ytext!: Y.Text;
  private provider!: WebsocketProvider;
  // Generate a random color for the local user's cursor
  private userColor: string = '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
  // ******************************

 targetLanguage: 'javascript' | 'python' | 'java' = 'java';

  @ViewChild('editor', { static: true }) editorEl!: ElementRef;
  editor!: EditorView;






constructor(
  private http: HttpClient,
  private converter: ConverterService,
  // 1. Inject PLATFORM_ID
  @Inject(PLATFORM_ID) private platformId: Object,
  private cdr: ChangeDetectorRef
) {
  // 2. Determine environment (crucial for SSR)
  this.isBrowser = isPlatformBrowser(this.platformId);
  this.userId = 'user_' + Math.random().toString(36).substr(2, 9);
}


ngOnInit(): void {

  console.log('Component is initialized.');

  
  }
  ngOnDestroy(): void {
    if (this.provider) {
      this.provider.destroy();
      console.log('WebsocketProvider destroyed.');
    }
    if (this.ydoc) {
      this.ydoc.destroy();
      console.log('Y.Doc destroyed.');
    }
    if (this.editor) {
      this.editor.destroy();
      console.log('EditorView destroyed.');
    }

    if (this.provider?.awareness) {
  this.provider.awareness.setLocalStateField("active", false);
}
this.cdr.detectChanges();
  }
ngAfterViewInit(): void {
  if(this.isBrowser)
  {
    
//this.initEditor(this.targetLanguage);
this.initCollaborativeEditor();

  }
     
  }

createAutoCompletion(): Extension
{
  console.log("auto complete...")
return  autocompletion({
  override: [this.languageSpecificCompletions.bind(this)],
  activateOnTyping: true
});

}

/**
 * Initializes the Yjs document, the network provider, and the CodeMirror editor.
 */
initCollaborativeEditor(): void {
    // 1. Initialize Yjs document and shared text
   if (this.initDone) {
  console.warn("Editor already initialized in this window.");
  return;
}
this.initDone = true;

// Cleanup existing

    this.ydoc = new Y.Doc();
    this.ytext = this.ydoc.getText('codemirror');
    
    

     const applyDefaultIfEmpty = () => {
      try {
        if (this.ytext.length === 0) {
          this.ytext.insert(0, this.default_code);
        }
      } catch (e) {
        console.error('applyDefaultIfEmpty error', e);
      }
    };

    console.log("url passed to backened...."+`ws://localhost:1234?room=${this.roomName}`)
    // 2. Initialize the Provider (y-webrtc for P2P collaboration)
    this.provider = new WebsocketProvider(`ws://localhost:1234`,this.roomName, this.ydoc)

    // 3. Set up user info (awareness)
    this.provider.awareness.setLocalStateField('user', {
      name: this.userId,
      active: true,
       userId: this.userId,
      color: this.userColor, 
    });

    // If provider already synced, apply; otherwise wait for first sync event
    if ((this.provider as any).isLoaded) {
      applyDefaultIfEmpty();
    } else {
      const onFirstSync = (isSynced: boolean) => {
        applyDefaultIfEmpty();
        try { this.provider?.off('sync', onFirstSync); } catch(e) {}
      };
      this.provider.on('sync', onFirstSync);
    }


    this.provider.on('status', (event) => { 
    // Access the 'status' property
    const isConnected = event.status === 'connected'; 
    this.isConnected = isConnected; 

    console.log('Provider status:', event.status);
    this.cdr.detectChanges();
});
    
    
    

    this.provider.awareness.on('update', () => {
        const states = Array.from(this.provider.awareness.getStates().values());
       // this.activeUsers = states.filter(s => s.active);
        this.activeUsersCount = states.length
        console.log("Active users:", states);
        this.cdr.detectChanges();
        
    });

    // 5. Create the EditorState and EditorView
    const state = EditorState.create({
      // Use ytext content for initial state
      doc: this.ytext.toString(), 
      extensions: [
        EditorView.lineWrapping,
        this.getThemeExtension(), 
        this.getLanguageExtension(this.targetLanguage),
        this.createAutoCompletion(),
        lineNumbers(),
        keymap.of(completionKeymap),
        
        // ** COLLABORATION EXTENSION: Links Y.Text to CodeMirror **
        yCollab(this.ytext, this.provider.awareness),
        // *******************************************************
        
        EditorView.updateListener.of((v) => {
          if (v.docChanged) {
            console.log("Updated:", v.state.doc.toString());
          }
        })
      ]
    });

    this.editor = new EditorView({
      state,
      parent: this.editorEl.nativeElement,
    });

    
}


  

  
getThemeExtension(): Extension {
    // Added styling for yCollab cursors and selections
    return EditorView.theme({
        '&': {
            height: '100%',
            backgroundColor: '#1e1e1e'
        },
        '.cm-content': {
            caretColor: '#ffffff'
        },
        '.cm-cursor': {
            borderLeftColor: '#ffffff'
        },
        '.cm-gutters': {
            backgroundColor: '#1e1e1e',
            color: '#858585',
            border: 'none'
        },
        '.cm-activeLineGutter': {
            backgroundColor: '#2d2d2d'
        },
        '.cm-activeLine': {
            backgroundColor: '#2d2d2d'
        },
        // ** COLLABORATION STYLES **
        '.cm-ySelection': {
            backgroundColor: 'var(--y-selection-color)',
            opacity: '0.3'
        },
        '.cm-yCursor': {
            borderLeftWidth: '2px',
            borderLeftStyle: 'solid',
            marginRight: '-1px',
            boxSizing: 'content-box',
        },
        '.cm-yCursorInfo': {
            position: 'absolute',
            top: '-1.0em', 
            left: '0', 
            fontSize: '12px',
            padding: '2px 4px',
            borderRadius: '3px',
            color: 'white',
            zIndex: '10', 
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            opacity: '0.9'
        }
        // ***************************
    });
}
  languageSpecificCompletions(context: CompletionContext) {
    console.log("called language specific completion.    ")
    const word = context.matchBefore(/\w*/);
    if (!word) return null;

    let options: any[] = [];

    // ===== JavaScript =====
    if (this.targetLanguage === "javascript") {
      options = [
        { label: "console.log", type: "function", info: "Print to console" },
        { label: "function", type: "keyword" },
        { label: "let", type: "keyword" },
        { label: "const", type: "keyword" },
        { label: "return", type: "keyword" },
      ];
    }

    // ===== Python =====
    else if (this.targetLanguage === "python") {
      options = [
        { label: "print", type: "function", info: "Print to console" },
        { label: "def", type: "keyword" },
        { label: "class", type: "keyword" },
        { label: "import", type: "keyword" },
        { label: "return", type: "keyword" }
      ];
    }
    // ===== Java =====
    else if (this.targetLanguage === "java") {
      options = [
        { label: "System.out.println", type: "function" },
        { label: "public", type: "keyword" },
        { label: "class", type: "keyword" },
        { label: "static", type: "keyword" },
        { label: "void", type: "keyword" },
        { label: "return", type: "keyword" }
      ];
    }

    return {
      from: word.from,
      options
    };
  }
    
 // Method to update the language mode in CodeMirror
changeLanguage(lang: string): void {

  const langExtension = this.getLanguageExtension(lang);
  
    

    
}

getLanguageExtension(lang: string): Extension {
    switch (lang) {
        case 'python':
            return python();
        case 'javascript':
            return javascript({ typescript: true });
        case 'java':
            return java();
        default:
            return java(); // Default to Java if something goes wrong
    }
}
// *** COMBINED METHOD for Dropdown Change ***
// This method is triggered by the (change) event on the select element.
handleLanguageChange(): void {
    // 1. Update CodeMirror language mode
     const currentCode = this.editor.state.doc.toString();
     console.log("current code...."+currentCode)

     if(currentCode&&currentCode.trim().length>0)
     {
 const shouldChange = confirm('Changing language will reset the editor. Continue?');

    if(shouldChange)
    {
    this.changeLanguage(this.targetLanguage); 

   console.log("language change"+this.targetLanguage)

    // 3. Trigger the code conversion
    this.convert(currentCode);

    }
    else{
       //this.changeLanguage(this.targetLanguage);
    }
     }
     else{
      this.changeLanguage(this.targetLanguage);
      confirm("Please enter a code block in the editor")
     }
    
    
}



convert(source_code: string) {

  console.log(source_code.toString+".  "+this.targetLanguage)

    if (source_code) {
        // Call the service to convert the code
        console.log(source_code.toString+".  "+this.targetLanguage)
        this.converter.convertCode(source_code, this.targetLanguage)
          .subscribe({
            next:(res) => 
            {

              this.ydoc.transact(() => {
                    this.ytext.delete(0, this.ytext.length);
                    this.ytext.insert(0, res.convertedCode);
              });
            }
              
            //this.updateEditorState(res.convertedCode)
            
            
            ,
    //         next: (res) => this.editor.dispatch(
    //           {
    //             changes: {
    //   from: 0,
    //   to: this.editor.state.doc.length,
    //   insert: this.cleanMarkdown(res.convertedCode)
    // }
    //           }
    //         ),
            error: (err) => 
              {
                console.error('Conversion failed', err)
                //showRateLimitDialog("Rate Limit Reached")
                //this.updateEditorState(this.default_code)
                this.ydoc.transact(() => {
                    this.ytext.delete(0, this.ytext.length);
                    this.ytext.insert(0, getDefaultCode(this.targetLanguage));
              });
              }
          });
    } else {
        // Clear converted code if source is empty
        this.convertedCode = ' '; 
        //this.updateEditorState(this.default_code)
    }
}
  



cleanMarkdown(convertedCode: any): string 
{

  return convertedCode.replace(/```[a-zA-Z0-9_-]*\s*/g, "")
    // Remove ending ```
    .replace(/```/g, "")
    // Remove markdown quote >
    .replace(/^>\s?/gm, "")
    // Trim extra blank lines
    .trim();

  

}

  

}



function showRateLimitDialog(arg0: string) {
 confirm(arg0)
}



function getDefaultCode(targetLanguage: string): string {
   const templates: { [key: string]: string } = {
      javascript: `// Welcome to the Collaborative Code Editor!
// Start coding in JavaScript

function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));`,
      
      python: `# Welcome to the Collaborative Code Editor!
# Start coding in Python

def greet(name):
    return f"Hello, {name}!"

print(greet("World"))`,
      
      java: `// Welcome to the Collaborative Code Editor!
// Start coding in Java

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
    
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
}`
    };
    
    return templates[targetLanguage];
 
}

