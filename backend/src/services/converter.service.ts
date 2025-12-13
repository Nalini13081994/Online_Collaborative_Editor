import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define the expected response structure from your conversion API
interface ConversionResponse {
  convertedCode: string;
}

@Injectable({
  // 'root' makes the service available throughout the application
  providedIn: 'root'
})
export class ConverterService {
  // *** UPDATE THIS URL to your actual conversion backend endpoint ***
  private apiUrl = 'http://localhost:5000/convert'; 

  constructor(private http: HttpClient) { }

  /**
   * Sends the source code and target language to the backend for conversion.
   * * @param sourceCode The code entered in the CodeMirror editor.
   * @param targetLanguage The language selected in the dropdown ('python', 'javascript', 'java').
   * @returns An Observable of the ConversionResponse object.
   */
  convertCode(sourceCode: string, targetLanguage: string): Observable<ConversionResponse> {
    // We use a POST request to send the data securely
    console.log(".    "+sourceCode+"   "+targetLanguage)
    const payload = {
      code: sourceCode,
      target: targetLanguage
    };
    
    return this.http.post<ConversionResponse>(this.apiUrl, payload);
  }
}