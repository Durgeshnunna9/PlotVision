// Mock Data for Real Estate App

export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  type: 'house' | 'apartment' | 'condo' | 'townhouse';
  status: 'available' | 'sold' | 'pending' | 'rented';
  agentId: string;
  images: string[];
  description: string;
  featured: boolean;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'buyer' | 'seller' | 'renter';
  status: 'active' | 'inactive' | 'converted';
  agentId: string;
  budget?: number;
  preferences?: string;
  lastContact: string;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  totalSales: number;
  activeListings: number;
  clientsCount: number;
  rating: number;
  managerId?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  dueDate: string;
  assignedTo: string;
  createdBy: string;
  propertyId?: string;
  clientId?: string;
}

// Mock Properties
export const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Modern Downtown Loft',
    address: '123 Main St, Downtown',
    price: 450000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1250,
    type: 'apartment',
    status: 'available',
    agentId: 'agent1',
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400'],
    description: 'Beautiful modern loft with city views',
    featured: true
  },
  {
    id: '2',
    title: 'Family Suburban Home',
    address: '456 Oak Ave, Suburbia',
    price: 675000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2800,
    type: 'house',
    status: 'pending',
    agentId: 'agent1',
    images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'],
    description: 'Perfect family home with large backyard',
    featured: false
  },
  {
    id: '3',
    title: 'Luxury Penthouse',
    address: '789 Sky Tower, Uptown',
    price: 1200000,
    bedrooms: 3,
    bathrooms: 3,
    sqft: 2200,
    type: 'condo',
    status: 'sold',
    agentId: 'agent2',
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400'],
    description: 'Stunning penthouse with panoramic views',
    featured: true
  }
];

// Mock Clients
export const mockClients: Client[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    type: 'buyer',
    status: 'active',
    agentId: 'agent1',
    budget: 500000,
    preferences: 'Modern apartment, downtown area',
    lastContact: '2024-01-15'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '(555) 234-5678',
    type: 'seller',
    status: 'converted',
    agentId: 'agent1',
    lastContact: '2024-01-10'
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike.w@email.com',
    phone: '(555) 345-6789',
    type: 'buyer',
    status: 'active',
    agentId: 'agent2',
    budget: 800000,
    preferences: 'Single family home, good schools',
    lastContact: '2024-01-12'
  }
];

// Mock Agents
export const mockAgents: Agent[] = [
  {
    id: 'agent1',
    name: 'Mike Agent',
    email: 'agent@test.com',
    phone: '(555) 111-2222',
    specialization: 'Residential Sales',
    totalSales: 1250000,
    activeListings: 8,
    clientsCount: 15,
    rating: 4.8,
    managerId: 'manager1'
  },
  {
    id: 'agent2',
    name: 'Lisa Rodriguez',
    email: 'lisa.r@realty.com',
    phone: '(555) 222-3333',
    specialization: 'Luxury Properties',
    totalSales: 2800000,
    activeListings: 5,
    clientsCount: 12,
    rating: 4.9,
    managerId: 'manager1'
  },
  {
    id: 'agent3',
    name: 'David Chen',
    email: 'david.c@realty.com',
    phone: '(555) 333-4444',
    specialization: 'Commercial Real Estate',
    totalSales: 1800000,
    activeListings: 6,
    clientsCount: 10,
    rating: 4.7
  }
];

// Mock Tasks
export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Schedule property viewing',
    description: 'Arrange viewing for downtown loft with John Smith',
    priority: 'high',
    status: 'todo',
    dueDate: '2024-01-20',
    assignedTo: 'agent1',
    createdBy: 'manager1',
    propertyId: '1',
    clientId: '1'
  },
  {
    id: '2',
    title: 'Follow up with potential buyer',
    description: 'Call Mike Wilson about his budget and preferences',
    priority: 'medium',
    status: 'in-progress',
    dueDate: '2024-01-18',
    assignedTo: 'agent2',
    createdBy: 'agent2',
    clientId: '3'
  },
  {
    id: '3',
    title: 'Complete listing photos',
    description: 'Upload professional photos for new property listing',
    priority: 'high',
    status: 'completed',
    dueDate: '2024-01-15',
    assignedTo: 'agent1',
    createdBy: 'agent1',
    propertyId: '2'
  }
];

// Analytics Mock Data
export const mockAnalytics = {
  totalProperties: 156,
  totalClients: 89,
  activeAgents: 12,
  monthlyRevenue: 2450000,
  salesData: [
    { month: 'Jan', sales: 850000 },
    { month: 'Feb', sales: 920000 },
    { month: 'Mar', sales: 780000 },
    { month: 'Apr', sales: 1100000 },
    { month: 'May', sales: 950000 },
    { month: 'Jun', sales: 1250000 }
  ],
  propertyTypes: [
    { type: 'Houses', count: 65, percentage: 42 },
    { type: 'Apartments', count: 48, percentage: 31 },
    { type: 'Condos', count: 28, percentage: 18 },
    { type: 'Townhouses', count: 15, percentage: 9 }
  ]
};