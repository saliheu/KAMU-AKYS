import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-leave-balance',
  templateUrl: './leave-balance.component.html',
  styleUrls: ['./leave-balance.component.scss']
})
export class LeaveBalanceComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  get annualLeaveRemaining(): number {
    if (!this.currentUser) return 0;
    return this.currentUser.annualLeaveBalance - this.currentUser.usedAnnualLeave;
  }

  get sickLeaveRemaining(): number {
    if (!this.currentUser) return 0;
    return this.currentUser.sickLeaveBalance - this.currentUser.usedSickLeave;
  }

  get annualLeavePercentage(): number {
    if (!this.currentUser || this.currentUser.annualLeaveBalance === 0) return 0;
    return (this.currentUser.usedAnnualLeave / this.currentUser.annualLeaveBalance) * 100;
  }

  get sickLeavePercentage(): number {
    if (!this.currentUser || this.currentUser.sickLeaveBalance === 0) return 0;
    return (this.currentUser.usedSickLeave / this.currentUser.sickLeaveBalance) * 100;
  }
}