import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { LeaveService } from '../../services/leave.service';
import { LeaveRequest } from '../../models/leave.model';

@Component({
  selector: 'app-my-leaves',
  templateUrl: './my-leaves.component.html',
  styleUrls: ['./my-leaves.component.scss']
})
export class MyLeavesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['leaveType', 'startDate', 'endDate', 'status', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<LeaveRequest>();
  loading = true;

  statusLabels: { [key: string]: string } = {
    PENDING: 'Beklemede',
    APPROVED: 'Onaylandı',
    REJECTED: 'Reddedildi',
    CANCELLED: 'İptal Edildi'
  };

  leaveTypeLabels: { [key: string]: string } = {
    ANNUAL: 'Yıllık İzin',
    SICK: 'Hastalık İzni',
    MARRIAGE: 'Evlilik İzni',
    BEREAVEMENT: 'Vefat İzni',
    MATERNITY: 'Doğum İzni',
    PATERNITY: 'Babalık İzni',
    OTHER: 'Diğer'
  };

  constructor(
    private leaveService: LeaveService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadLeaveRequests();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadLeaveRequests(): void {
    this.loading = true;
    this.leaveService.getMyLeaveRequests().subscribe({
      next: (response) => {
        this.dataSource.data = response.content;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('İzin talepleri yüklenemedi', 'Kapat', {
          duration: 3000
        });
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'APPROVED':
        return 'status-approved';
      case 'REJECTED':
        return 'status-rejected';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  canCancel(leave: LeaveRequest): boolean {
    return leave.status === 'PENDING' && new Date(leave.startDate) > new Date();
  }

  cancelLeave(leave: LeaveRequest): void {
    if (confirm('Bu izin talebini iptal etmek istediğinizden emin misiniz?')) {
      this.leaveService.cancelLeaveRequest(leave.id).subscribe({
        next: () => {
          this.snackBar.open('İzin talebi iptal edildi', 'Kapat', {
            duration: 3000
          });
          this.loadLeaveRequests();
        },
        error: (error) => {
          this.snackBar.open('İzin talebi iptal edilemedi', 'Kapat', {
            duration: 3000
          });
        }
      });
    }
  }
}