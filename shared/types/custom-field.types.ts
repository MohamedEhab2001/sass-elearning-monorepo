/**
 * Custom field types for student segmentation
 */

export enum CustomFieldType {
  TEXT = 'text',
  SELECT = 'select',
  NUMBER = 'number',
  DATE = 'date',
  EMAIL = 'email',
  PHONE = 'phone',
}

export interface ICustomField {
  _id: string;
  tenantId: string;
  fieldName: string; // Internal key (e.g., "company_name")
  fieldLabel: string; // Display label in Arabic (e.g., "اسم الشركة")
  fieldType: CustomFieldType;
  options?: string[]; // For SELECT type
  required: boolean;
  placeholder?: string;
  order: number; // Display order
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomFieldDto {
  fieldName: string;
  fieldLabel: string;
  fieldType: CustomFieldType;
  options?: string[];
  required: boolean;
  placeholder?: string;
}

export interface UpdateCustomFieldDto {
  fieldLabel?: string;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  isActive?: boolean;
  order?: number;
}

export interface ReorderCustomFieldsDto {
  fieldIds: string[]; // Array of field IDs in desired order
}

/**
 * Student profile with custom field values
 */
export interface IStudentProfile {
  userId: string;
  tenantId: string;
  customFieldValues: Record<string, any>; // { fieldName: value }
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentFilterDto {
  customFields?: Record<string, any>; // { fieldName: value }
  searchTerm?: string;
  role?: string;
}
