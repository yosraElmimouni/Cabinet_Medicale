export interface Cabinet {
  id: number;
  logo?: string;
  nomCabinet: string;
  adresseCabinet: string;
  emailCabinet: string;
  teleCabinet: string;
  superAdminId?: number;
  createdAt?: string;
  updatedAt?: string;
  statut?: 'ACTIF' | 'INACTIF' | 'SUSPENDU';
}

export interface CabinetFormData {
  logo?: File;
  nomCabinet: string;
  adresseCabinet: string;
  emailCabinet: string;
  teleCabinet: string;
  superAdminId?: number;
  statut?: 'ACTIF' | 'INACTIF' | 'SUSPENDU';
}

export interface CabinetStats {
  total: number;
  actifs: number;
  inactifs: number;
  suspendus: number;
}

export interface CabinetFilter {
  searchTerm: string;
  statut?: 'ACTIF' | 'INACTIF' | 'SUSPENDU' | 'ALL';
  page: number;
  itemsPerPage: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}