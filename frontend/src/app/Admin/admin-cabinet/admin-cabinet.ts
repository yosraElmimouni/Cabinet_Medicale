import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CabinetService, Cabinet, CabinetRequest, CabinetStats } from '../../services/cabinet';
import { AuthService } from '../../services/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-cabinet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-cabinet.html',
  styleUrls: ['./admin-cabinet.scss']
})
export class AdminCabinet implements OnInit, OnDestroy {
  paginatedCabinets: any[] = [];
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  showAddForm = false;
  isEditMode = false;
  
  searchTerm = '';
  filterStatus = 'ALL';
  itemsPerPage = 10;
  currentPage = 1;

  newCabinet: any = {
    nomCabinet: '',
    adresseCabinet: '',
    emailCabinet: '',
    teleCabinet: '',
    statut: 'ACTIF'
  };
  
  logoFile: File | null = null;
  logoPreview: string | null = null;
  
  private subscriptions = new Subscription();

  constructor(
    private cabinetService: CabinetService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
   
    this.onSearch();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  

  onSearch(): void {
    this.isLoading = true;
    const filter = {
      searchTerm: this.searchTerm,
      statut: this.filterStatus as any,
      page: this.currentPage - 1,
      itemsPerPage: this.itemsPerPage
    };

    this.cabinetService.searchCabinets(filter).subscribe({
      next: (response) => {
        this.paginatedCabinets = response.items;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = "Erreur lors du chargement des cabinets";
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.onSearch();
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  editCabinet(cabinet: any): void {
    this.isEditMode = true;
    this.showAddForm = true;
    this.newCabinet = { ...cabinet };
    this.logoPreview = cabinet.logo || null;
    setTimeout(() => {
      document.getElementById('cabinet-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  addCabinet(): void {
    this.isSubmitting = true;
    const request: CabinetRequest = {
      nomCabinet: this.newCabinet.nomCabinet,
      adresseCabinet: this.newCabinet.adresseCabinet,
      emailCabinet: this.newCabinet.emailCabinet,
      teleCabinet: this.newCabinet.teleCabinet
    };

    if (this.isEditMode && this.newCabinet.id) {
      this.cabinetService.updateCabinet(this.newCabinet.id, request, this.logoFile || undefined).subscribe({
        next: () => {
          this.successMessage = "Cabinet mis à jour avec succès";
          this.handleActionSuccess();
        },
        error: (err) => this.handleActionError(err)
      });
    } else {
      this.cabinetService.createCabinet(request).subscribe({
        next: () => {
          this.successMessage = "Cabinet créé avec succès";
          this.handleActionSuccess();
        },
        error: (err) => this.handleActionError(err)
      });
    }
  }

  private handleActionSuccess(): void {
    this.isSubmitting = false;
    this.showAddForm = false;
    this.resetForm();
    this.onSearch();
    
    setTimeout(() => this.successMessage = '', 3000);
  }

  private handleActionError(err: any): void {
    this.errorMessage = "Une erreur est survenue lors de l'opération";
    this.isSubmitting = false;
  }

  deleteCabinet(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce cabinet ?')) {
      this.cabinetService.deleteCabinet(id).subscribe({
        next: () => {
          this.successMessage = "Cabinet supprimé";
          this.onSearch();
          
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: () => alert('Erreur lors de la suppression')
      });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.logoFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.logoPreview = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  removeLogo(): void {
    this.logoFile = null;
    this.logoPreview = null;
  }

  resetForm(): void {
    this.newCabinet = {
      nomCabinet: '',
      adresseCabinet: '',
      emailCabinet: '',
      teleCabinet: '',
      statut: 'ACTIF'
    };
    this.logoFile = null;
    this.logoPreview = null;
    this.isEditMode = false;
    this.errorMessage = '';
  }

  changeItemsPerPage(count: any): void {
    this.itemsPerPage = Number(count);
    this.currentPage = 1;
    this.onSearch();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.onSearch();
    }
  }

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'ACTIF': return 'badge bg-success';
      case 'INACTIF': return 'badge bg-warning';
      case 'SUSPENDU': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  getStatusText(statut: string): string {
    switch (statut) {
      case 'ACTIF': return 'Actif';
      case 'INACTIF': return 'Inactif';
      case 'SUSPENDU': return 'Suspendu';
      default: return statut || 'Inconnu';
    }
  }

  get totalPages(): number {
    return 1; // À adapter si le backend renvoie le total
  }

  getPages(): number[] {
    return [1];
  }

  getMaxDisplayCount(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.paginatedCabinets.length);
  }

  get filteredCabinets(): any[] {
    return this.paginatedCabinets;
  }
}
