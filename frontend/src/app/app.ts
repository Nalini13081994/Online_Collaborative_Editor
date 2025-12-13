import { Component, signal } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { EditorPage } from './editor-page/editor-page';


@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
  imports: [HttpClientModule, EditorPage]
  
})
export class App {
  protected readonly title = signal('Online_Editor_with_AI');
}
