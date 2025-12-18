import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConverterService {
  private apiUrl = 'http://localhost:5000/api/convert';
  private autoCompleteUrl = 'http://localhost:5000/api/autocomplete'

  constructor(private http: HttpClient) {}

  convertCode(sourceCode: string, targetLanguage: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { sourceCode, targetLanguage });
  }
  getAutoComplete(sourceCode:string, targetLanguage: string): Observable<any>
  {
    return this.http.post<any>(this.autoCompleteUrl, { sourceCode, targetLanguage });
  }
}
