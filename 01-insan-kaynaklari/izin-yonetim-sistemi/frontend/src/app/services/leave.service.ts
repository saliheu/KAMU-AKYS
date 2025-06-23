import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateLeaveRequest, LeaveRequest } from '../models/leave.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private apiUrl = `${environment.apiUrl}/leave-requests`;

  constructor(private http: HttpClient) {}

  createLeaveRequest(request: CreateLeaveRequest): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(this.apiUrl, request);
  }

  getMyLeaveRequests(): Observable<{ content: LeaveRequest[], totalElements: number }> {
    return this.http.get<{ content: LeaveRequest[], totalElements: number }>(`${this.apiUrl}/my-requests`);
  }

  getLeaveRequest(id: number): Observable<LeaveRequest> {
    return this.http.get<LeaveRequest>(`${this.apiUrl}/${id}`);
  }

  cancelLeaveRequest(id: number): Observable<LeaveRequest> {
    return this.http.put<LeaveRequest>(`${this.apiUrl}/${id}/cancel`, {});
  }
}