import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { DossierMedical } from '../../models/dossier-medical.model';

@Component({
  selector: 'app-dossier-medical',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dossier-medical.html',
  styleUrls: ['./dossier-medical.scss']
})
export class DossierMedicalComponent implements OnInit {
  @Input() patientId!: number;
  @Input() dossier?: DossierMedical;
  @Output() submit = new EventEmitter<DossierMedical>();
  @Output() cancel = new EventEmitter<void>();

  dossierForm!: FormGroup;
  isEditing = false;
  selectedFile?: File;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initForm();
    if (this.dossier) {
      this.isEditing = true;
      this.patchForm();
    }
  }

  initForm() {
    this.dossierForm = this.fb.group({
      antMedicaux: [''],
      antChirurg: [''],
      allergies: [''],
      traitementEnCour: [''],
      habitudes: [''],
      typeMutuelle: [''],
      documentsMedicaux: this.fb.array([])
    });
  }

  // Getter pour les documents
  get documentsArray(): FormArray {
    return this.dossierForm.get('documentsMedicaux') as FormArray;
  }

  patchForm() {
    if (this.dossier) {
      console.log('Patch form with dossier:', this.dossier);
      
      this.dossierForm.patchValue({
        antMedicaux: this.dossier.antMedicaux || '',
        antChirurg: this.dossier.antChirurg || '',
        allergies: this.dossier.allergies || '',
        traitementEnCour: this.dossier.traitementEnCour || '',
        habitudes: this.dossier.habitudes || '',
        typeMutuelle: this.dossier.typeMutuelle || ''
      });

      // Ajouter les documents existants
      if (this.dossier.documentsMedicaux && this.dossier.documentsMedicaux.length > 0) {
        this.dossier.documentsMedicaux.forEach(doc => {
          this.documentsArray.push(this.fb.control(doc));
        });
      }
      
      console.log('Form after patch:', this.dossierForm.value);
    } else {
      console.log('No dossier provided, creating new one');
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  uploadDocument() {
    if (this.selectedFile) {
      const fileName = this.selectedFile.name;
      this.documentsArray.push(this.fb.control(fileName));
      this.selectedFile = undefined;
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  }

  removeDocument(index: number) {
    this.documentsArray.removeAt(index);
  }

  onSubmit() {
    console.log('Form submitted:', this.dossierForm.value);
    
    if (this.dossierForm.valid) {
      const formValue = this.dossierForm.value;
      const dossier: DossierMedical = {
        antMedicaux: formValue.antMedicaux || '',
        antChirurg: formValue.antChirurg || '',
        allergies: formValue.allergies || '',
        traitementEnCour: formValue.traitementEnCour || '',
        habitudes: formValue.habitudes || '',
        typeMutuelle: formValue.typeMutuelle || '',
        documentsMedicaux: formValue.documentsMedicaux || [],
        idMedecin: this.dossier?.idMedecin || 123, // À remplacer par l'ID réel
        idPatient: this.patientId
      };
      
      // Si modification, garder l'ID existant
      if (this.dossier?.idDossier) {
        dossier.idDossier = this.dossier.idDossier;
      }
      
      // Si modification, garder la date de création
      if (this.dossier?.dateCreation) {
        dossier.dateCreation = this.dossier.dateCreation;
      } else {
        dossier.dateCreation = new Date();
      }
      
      console.log('Emitting dossier:', dossier);
      this.submit.emit(dossier);
    } else {
      console.log('Form is invalid');
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}