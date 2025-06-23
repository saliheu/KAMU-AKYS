import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  
  stats = {
    annualLeaveRemaining: 0,
    sickLeaveRemaining: 0,
    pendingRequests: 0,
    approvedRequests: 0
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.stats.annualLeaveRemaining = this.currentUser.annualLeaveBalance - this.currentUser.usedAnnualLeave;
      this.stats.sickLeaveRemaining = this.currentUser.sickLeaveBalance - this.currentUser.usedSickLeave;
    }
  }
}