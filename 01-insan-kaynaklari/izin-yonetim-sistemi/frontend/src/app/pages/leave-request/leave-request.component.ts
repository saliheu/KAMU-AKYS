import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { LeaveService } from '../../services/leave.service';

@Component({
  selector: 'app-leave-request',
  templateUrl: './leave-request.component.html',
  styleUrls: ['./leave-request.component.scss']
})
export class LeaveRequestComponent implements OnInit {
  leaveForm!: FormGroup;
  loading = false;
  minDate = new Date();
  
  leaveTypes = [
    { value: 'ANNUAL', label: 'Yıllık İzin' },
    { value: 'SICK', label: 'Hastalık İzni' },
    { value: 'MARRIAGE', label: 'Evlilik İzni' },
    { value: 'BEREAVEMENT', label: 'Vefat İzni' },
    { value: 'MATERNITY', label: 'Doğum İzni' },
    { value: 'PATERNITY', label: 'Babalık İzni' },
    { value: 'OTHER', label: 'Diğer' }
  ];

  constructor(
    private fb: FormBuilder,
    private leaveService: LeaveService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.leaveForm = this.fb.group({
      leaveType: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      reason: [''],
      halfDay: [false],
      halfDayPeriod: ['']
    });

    this.leaveForm.get('halfDay')?.valueChanges.subscribe(isHalfDay => {
      const halfDayPeriodControl = this.leaveForm.get('halfDayPeriod');
      if (isHalfDay) {
        halfDayPeriodControl?.setValidators(Validators.required);
        this.leaveForm.patchValue({ endDate: this.leaveForm.get('startDate')?.value });
      } else {
        halfDayPeriodControl?.clearValidators();
      }
      halfDayPeriodControl?.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    if (this.leaveForm.valid) {
      this.loading = true;
      this.leaveService.createLeaveRequest(this.leaveForm.value).subscribe({
        next: () => {
          this.snackBar.open('İzin talebiniz başarıyla oluşturuldu', 'Kapat', {
            duration: 3000
          });
          this.router.navigate(['/my-leaves']);
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(
            error.error?.message || 'İzin talebi oluşturulamadı',
            'Kapat',
            { duration: 3000 }
          );
        }
      });
    }
  }
}