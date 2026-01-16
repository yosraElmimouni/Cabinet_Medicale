import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Import des services et interfaces
import { 
  CabinetService, 
  Cabinet, 
  CreateCabinetRequest, 
  CabinetStats, 
  CabinetFilter, 
  PaginatedResponse 
} from '../../services/cabinet';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number = 20, trail: string = '...'): string {
    if (!value) return '';
    return value.length > limit ? value.substring(0, limit) + trail : value;
  }
}
@Component({
  selector: 'app-admin-sup-cabinet',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TruncatePipe
  ],
  templateUrl: './admin-sup-cabinet.html',
  styleUrls: ['./admin-sup-cabinet.scss'],
})
export class AdminSupCabinet implements OnInit, OnDestroy {
  currentDateTime: string = new Date().toLocaleString();
  isLoading = false;
  isSubmitting = false;
  showForm = false;
  errorMessage = '';
  
  stats: any[] = [];
  editingCabinet: any = null;
  selectedCabinet: any = null;
  logoPreview: string | null = null;
  logoFile: File | null = null;
  filter: CabinetFilter = {
    searchTerm: '',
    statut: 'ALL',
    page: 1,
    itemsPerPage: 10
  };
  paginatedResponse: PaginatedResponse<any> | null = null;

  cabinetForm: FormGroup;
  private destroy$ = new Subject<void>();
  private timeInterval: any;

  constructor(
    private cabinetService: CabinetService,
    private fb: FormBuilder
  ) {
    this.cabinetForm = this.fb.group({
      nomCabinet: ['', [Validators.required, Validators.minLength(3)]],
      adresseCabinet: ['', Validators.required],
      emailCabinet: ['', [Validators.required, Validators.email]],
      teleCabinet: ['', Validators.required],
      statut: ['ACTIF']
    });
  }

  ngOnInit() {
    this.refreshData();
    this.updateTime();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  updateTime() {
    this.timeInterval = setInterval(() => {
      this.currentDateTime = new Date().toLocaleString();
    }, 1000);
  }

  refreshData() {
    
    this.loadCabinets();
  }

  loadCabinets() {
    this.isLoading = true;
    this.cabinetService.searchCabinets(this.filter).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.paginatedResponse = response;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = "Erreur lors du chargement des cabinets";
        this.isLoading = false;
      }
    });
  }

  onSearch() {
    this.filter.page = 1;
    this.loadCabinets();
  }

  onFilterChange() {
    this.filter.page = 1;
    this.loadCabinets();
  }

  onSubmit() {
    if (this.cabinetForm.invalid) return;

    this.isSubmitting = true;
    const request: CreateCabinetRequest = this.cabinetForm.value;

    if (this.editingCabinet) {
      this.cabinetService.updateCabinet(this.editingCabinet.id, request, this.logoFile || undefined).subscribe({
        next: () => {
          this.handleSuccess('Cabinet mis à jour avec succès');
        },
        error: (err) => this.handleError(err)
      });
    } else {
      this.cabinetService.createCabinet(request).subscribe({
        next: () => {
          this.handleSuccess('Cabinet créé avec succès');
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleSuccess(message: string) {
    this.isSubmitting = false;
    this.showForm = false;
    this.editingCabinet = null;
    this.logoFile = null;
    this.logoPreview = null;
    this.cabinetForm.reset({ statut: 'ACTIF' });
    this.refreshData();
    alert(message);
  }

  private handleError(err: any) {
    this.isSubmitting = false;
    this.errorMessage = err.error?.message || "Une erreur est survenue";
  }

  showAddForm() {
    this.editingCabinet = null;
    this.showForm = true;
    this.logoPreview = null;
    this.logoFile = null;
    this.cabinetForm.reset({ statut: 'ACTIF' });
  }

  editCabinet(cabinet: any) {
    this.editingCabinet = cabinet;
    this.showForm = true;
    this.logoPreview = cabinet.logo || null;
    this.cabinetForm.patchValue({
      nomCabinet: cabinet.nomCabinet,
      adresseCabinet: cabinet.adresseCabinet,
      emailCabinet: cabinet.emailCabinet,
      teleCabinet: cabinet.teleCabinet,
      statut: cabinet.statut || 'ACTIF'
    });
  }

  hideForm() {
    this.showForm = false;
    this.editingCabinet = null;
    this.errorMessage = '';
  }

  deleteCabinet(cabinet: any) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le cabinet ${cabinet.nomCabinet} ?`)) {
      this.cabinetService.deleteCabinet(cabinet.id).subscribe({
        next: () => {
          this.refreshData();
          alert('Cabinet supprimé avec succès');
        },
        error: () => alert('Erreur lors de la suppression')
      });
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.logoFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.logoPreview = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  removeLogo() {
    this.logoFile = null;
    this.logoPreview = null;
  }

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'ACTIF': return 'Actif';
      case 'INACTIF': return 'Inactif';
      case 'SUSPENDU': return 'Suspendu';
      default: return statut || 'Inconnu';
    }
  }

  previousPage() {
    if (this.filter.page > 1) {
      this.filter.page--;
      this.loadCabinets();
    }
  }

  nextPage() {
    if (this.paginatedResponse && this.filter.page < this.paginatedResponse.totalPages) {
      this.filter.page++;
      this.loadCabinets();
    }
  }

  exportData() {
    alert('Exportation des données...');
  }

  toggleStatusFilter() {
    // Logique pour ouvrir un menu de filtres avancés si nécessaire
  }

  selectCabinet(cabinet: any) {
    this.selectedCabinet = cabinet;
  }
}

