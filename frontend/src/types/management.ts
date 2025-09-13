export interface ManagementSectionProps {
  searchTerm: string
  updateSearchTerm: (section: string, value: string) => void
  handleCreateNew?: (type: string) => void
  handleTableRowClick?: (type: string, data: any) => void
  handleClassCardClick?: (data: any) => void
}
