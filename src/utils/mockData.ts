/**
 * Mock Data for Testing (No Supabase Required)
 * This file contains all dummy data stored in memory
 */

// Categories Mock Data
export const mockCategories = [
  { id: '1', name: 'Propellers', description: 'Drone propellers and blades', status: 'active' },
  { id: '2', name: 'Motors', description: 'Brushless and servo motors', status: 'active' },
  { id: '3', name: 'Flight Controllers', description: 'Flight control boards and systems', status: 'active' },
  { id: '4', name: 'Batteries', description: 'LiPo batteries and power systems', status: 'active' },
  { id: '5', name: 'Sensors', description: 'GPS, IMU, and other sensors', status: 'active' },
  { id: '6', name: 'Frames', description: 'Drone frames and chassis', status: 'active' },
  { id: '7', name: 'Cameras', description: 'FPV and recording cameras', status: 'active' },
  { id: '8', name: 'Electronic Components', description: 'ESCs, receivers, and other electronics', status: 'active' }
];

// Inventory Parts Mock Data
export const mockInventoryParts = [
  // Propellers
  { id: 'p1', sku: 'PROP9450CF01', name: '9450 Carbon Fiber Propeller Set', category_id: '1', manufacturer: 'DJI', serial_number: 'SN-PROP-001', quantity: 50, price: 1200.00, status: 'active' },
  { id: 'p2', sku: 'PROP8045PAIR', name: '8045 Quick Release Propeller Pair', category_id: '1', manufacturer: 'T-Motor', serial_number: 'SN-PROP-002', quantity: 35, price: 850.00, status: 'active' },
  { id: 'p3', sku: 'PROP1047FLD', name: '10x4.7 Foldable Propellers', category_id: '1', manufacturer: 'Gemfan', serial_number: 'SN-PROP-003', quantity: 28, price: 680.00, status: 'active' },
  
  // Motors
  { id: 'p4', sku: 'MOT2216900KV', name: '2216 900KV Brushless Motor', category_id: '2', manufacturer: 'Sunnysky', serial_number: 'SN-MOT-001', quantity: 20, price: 2800.00, status: 'active' },
  { id: 'p5', sku: 'MOT2212980KV', name: '2212 980KV Outrunner Motor', category_id: '2', manufacturer: 'Emax', serial_number: 'SN-MOT-002', quantity: 15, price: 2200.00, status: 'active' },
  { id: 'p6', sku: 'MOT2814770KV', name: '2814 770KV High Power Motor', category_id: '2', manufacturer: 'T-Motor', serial_number: 'SN-MOT-003', quantity: 12, price: 3500.00, status: 'active' },
  
  // Flight Controllers
  { id: 'p7', sku: 'FC-PIXHAWK4', name: 'Pixhawk 4 Flight Controller', category_id: '3', manufacturer: 'Holybro', serial_number: 'SN-FC-001', quantity: 8, price: 18500.00, status: 'active' },
  { id: 'p8', sku: 'FC-APM2.8', name: 'APM 2.8 Flight Controller', category_id: '3', manufacturer: 'ArduPilot', serial_number: 'SN-FC-002', quantity: 10, price: 8900.00, status: 'active' },
  { id: 'p9', sku: 'FC-NAZE32REV6', name: 'Naze32 Rev6 Flight Controller', category_id: '3', manufacturer: 'AfroFlight', serial_number: 'SN-FC-003', quantity: 6, price: 4200.00, status: 'active' },
  
  // Batteries
  { id: 'p10', sku: 'BAT4S5000MAH', name: '4S 5000mAh 60C LiPo Battery', category_id: '4', manufacturer: 'Tattu', serial_number: 'SN-BAT-001', quantity: 25, price: 5600.00, status: 'active' },
  { id: 'p11', sku: 'BAT6S6000MAH', name: '6S 6000mAh 50C LiPo Battery', category_id: '4', manufacturer: 'Gens Ace', serial_number: 'SN-BAT-002', quantity: 18, price: 8900.00, status: 'active' },
  { id: 'p12', sku: 'BAT3S2200MAH', name: '3S 2200mAh 30C LiPo Battery', category_id: '4', manufacturer: 'Turnigy', serial_number: 'SN-BAT-003', quantity: 40, price: 1800.00, status: 'active' },
  
  // Sensors
  { id: 'p13', sku: 'GPS-UBLOXM8N', name: 'Ublox NEO-M8N GPS Module', category_id: '5', manufacturer: 'Ublox', serial_number: 'SN-GPS-001', quantity: 15, price: 3200.00, status: 'active' },
  { id: 'p14', sku: 'SENS-MPU6050', name: 'MPU6050 6-Axis IMU Sensor', category_id: '5', manufacturer: 'InvenSense', serial_number: 'SN-IMU-001', quantity: 30, price: 850.00, status: 'active' },
  { id: 'p15', sku: 'SENS-BMP280', name: 'BMP280 Barometric Pressure Sensor', category_id: '5', manufacturer: 'Bosch', serial_number: 'SN-BAR-001', quantity: 22, price: 650.00, status: 'active' },
  
  // Frames
  { id: 'p16', sku: 'FRAME-F450', name: 'F450 Quadcopter Frame Kit', category_id: '6', manufacturer: 'DJI', serial_number: 'SN-FRAME-001', quantity: 12, price: 4500.00, status: 'active' },
  { id: 'p17', sku: 'FRAME-S500', name: 'S500 Carbon Fiber Frame', category_id: '6', manufacturer: 'Hobbyking', serial_number: 'SN-FRAME-002', quantity: 8, price: 6200.00, status: 'active' },
  { id: 'p18', sku: 'FRAME-ZMR250', name: 'ZMR250 Mini Quad Frame', category_id: '6', manufacturer: 'RMRC', serial_number: 'SN-FRAME-003', quantity: 10, price: 2800.00, status: 'active' },
  
  // Cameras
  { id: 'p19', sku: 'CAM-GOPRO10', name: 'GoPro Hero 10 Action Camera', category_id: '7', manufacturer: 'GoPro', serial_number: 'SN-CAM-001', quantity: 5, price: 42000.00, status: 'active' },
  { id: 'p20', sku: 'CAM-RUNCAM5', name: 'RunCam 5 4K FPV Camera', category_id: '7', manufacturer: 'RunCam', serial_number: 'SN-CAM-002', quantity: 7, price: 15500.00, status: 'active' },
  
  // Electronic Components
  { id: 'p21', sku: 'ESC-30A', name: '30A Brushless ESC', category_id: '8', manufacturer: 'Hobbywing', serial_number: 'SN-ESC-001', quantity: 40, price: 1200.00, status: 'active' },
  { id: 'p22', sku: 'RX-FRSKY', name: 'FrSky X8R 8-16Ch Receiver', category_id: '8', manufacturer: 'FrSky', serial_number: 'SN-RX-001', quantity: 16, price: 3800.00, status: 'active' },
  { id: 'p23', sku: 'PDB-5V12V', name: 'Power Distribution Board 5V/12V', category_id: '8', manufacturer: 'Matek', serial_number: 'SN-PDB-001', quantity: 25, price: 980.00, status: 'active' }
];

export const mockDroneTypes = [
  { id: 'dt1', name: 'Quadcopter X450', description: 'Standard 450mm quadcopter for training and photography', manufacturer: 'SuperBee Custom', status: 'ready_to_fly' },
  { id: 'dt2', name: 'Hexacopter H680', description: 'Heavy-lift 680mm hexacopter for payload delivery', manufacturer: 'SuperBee Custom', status: 'ready_to_fly' },
  { id: 'dt3', name: 'Racing Drone R250', description: 'High-speed 250mm racing quadcopter', manufacturer: 'SuperBee Custom', status: 'ready_to_fly' },
  { id: 'dt4', name: 'Surveillance S800', description: 'Long-range 800mm octocopter for surveillance', manufacturer: 'SuperBee Custom', status: 'ready_to_fly' },
  { id: 'dt5', name: 'Agri Drone AG1000', description: '1000mm agricultural spray drone', manufacturer: 'SuperBee Custom', status: 'ready_to_fly' }
];

// Drones Mock Data
export const mockDrones = [
  { id: 'd1', drone_type_id: 'dt1', drone_number: 'SB-QUAD-001', uin_number: 'UIN-1A2B3C4D5E6F', status: 'active', location: 'Warehouse A' },
  { id: 'd2', drone_type_id: 'dt1', drone_number: 'SB-QUAD-002', uin_number: 'UIN-2F3E4D5C6B7A', status: 'active', location: 'Warehouse A' },
  { id: 'd3', drone_type_id: 'dt2', drone_number: 'SB-HEXA-001', uin_number: 'UIN-3G4H5I6J7K8L', status: 'active', location: 'Warehouse B' },
  { id: 'd4', drone_type_id: 'dt3', drone_number: 'SB-RACE-001', uin_number: 'UIN-4M5N6O7P8Q9R', status: 'maintenance', location: 'Service Center' },
  { id: 'd5', drone_type_id: 'dt4', drone_number: 'SB-SURV-001', uin_number: 'UIN-5S6T7U8V9W0X', status: 'active', location: 'Field Operations' },
  { id: 'd6', drone_type_id: 'dt5', drone_number: 'SB-AGRI-001', uin_number: 'UIN-6Y7Z8A9B0C1D', status: 'active', location: 'Agriculture Site' },
  { id: 'd7', drone_type_id: 'dt1', drone_number: 'SB-QUAD-003', uin_number: 'UIN-7E8F9G0H1I2J', status: 'retired', location: 'Storage' },
  { id: 'd8', drone_type_id: 'dt2', drone_number: 'SB-HEXA-002', uin_number: 'UIN-8K9L0M1N2O3P', status: 'active', location: 'Warehouse B' }
];

// AE Requests Mock Data
export const mockAERequests = [
  // Pending Requests
  {
    id: 'ae1',
    drone_number: 'SB-QUAD-001',
    uin_number: 'UIN-1A2B3C4D5E6F',
    items: [
      { part_id: 'PROP9450CF01', part_name: '9450 Carbon Fiber Propeller Set', quantity: 2 },
      { part_id: 'MOT2216900KV', part_name: '2216 900KV Brushless Motor', quantity: 1 }
    ],
    requested_by: 'Rajesh Kumar',
    email: 'rajesh.kumar@superbee.com',
    status: 'pending',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ae2',
    drone_number: 'SB-HEXA-001',
    uin_number: 'UIN-3G4H5I6J7K8L',
    items: [
      { part_id: 'BAT4S5000MAH', part_name: '4S 5000mAh 60C LiPo Battery', quantity: 3 },
      { part_id: 'ESC-30A', part_name: '30A Brushless ESC', quantity: 6 }
    ],
    requested_by: 'Priya Sharma',
    email: 'priya.sharma@superbee.com',
    status: 'pending',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ae3',
    drone_number: 'SB-RACE-001',
    uin_number: 'UIN-4M5N6O7P8Q9R',
    items: [
      { part_id: 'FRAME-ZMR250', part_name: 'ZMR250 Mini Quad Frame', quantity: 1 },
      { part_id: 'CAM-RUNCAM5', part_name: 'RunCam 5 4K FPV Camera', quantity: 1 },
      { part_id: 'RX-FRSKY', part_name: 'FrSky X8R Receiver', quantity: 1 }
    ],
    requested_by: 'Amit Patel',
    email: 'amit.patel@superbee.com',
    status: 'pending',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  
  // Approved Requests
  {
    id: 'ae4',
    drone_number: 'SB-QUAD-002',
    uin_number: 'UIN-2F3E4D5C6B7A',
    items: [
      { part_id: 'GPS-UBLOXM8N', part_name: 'Ublox NEO-M8N GPS Module', quantity: 1 },
      { part_id: 'SENS-MPU6050', part_name: 'MPU6050 6-Axis IMU', quantity: 2 }
    ],
    requested_by: 'Sunita Reddy',
    email: 'sunita.reddy@superbee.com',
    status: 'approved',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ae5',
    drone_number: 'SB-SURV-001',
    uin_number: 'UIN-5S6T7U8V9W0X',
    items: [
      { part_id: 'CAM-GOPRO10', part_name: 'GoPro Hero 10 Action Camera', quantity: 1 },
      { part_id: 'BAT6S6000MAH', part_name: '6S 6000mAh LiPo Battery', quantity: 2 }
    ],
    requested_by: 'Vikram Singh',
    email: 'vikram.singh@superbee.com',
    status: 'approved',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  
  // Rejected Requests
  {
    id: 'ae6',
    drone_number: 'SB-AGRI-001',
    uin_number: 'UIN-6Y7Z8A9B0C1D',
    items: [
      { part_id: 'MOT2814770KV', part_name: '2814 770KV Motor', quantity: 10 }
    ],
    requested_by: 'Neha Gupta',
    email: 'neha.gupta@superbee.com',
    status: 'rejected',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ae7',
    drone_number: 'SB-HEXA-002',
    uin_number: 'UIN-8K9L0M1N2O3P',
    items: [
      { part_id: 'FRAME-S500', part_name: 'S500 Carbon Fiber Frame', quantity: 5 }
    ],
    requested_by: 'Arjun Mehta',
    email: 'arjun.mehta@superbee.com',
    status: 'rejected',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Initialize Mock Data in LocalStorage
export const initializeMockData = () => {
  // Only initialize if not already done
  if (!localStorage.getItem('mockDataInitialized')) {
    localStorage.setItem('mockCategories', JSON.stringify(mockCategories));
    localStorage.setItem('mockInventoryParts', JSON.stringify(mockInventoryParts));
    localStorage.setItem('mockDroneTypes', JSON.stringify(mockDroneTypes));
    localStorage.setItem('mockDrones', JSON.stringify(mockDrones));
    localStorage.setItem('mockAERequests', JSON.stringify(mockAERequests));
    localStorage.setItem('mockDataInitialized', 'true');
    
    console.log('✅ Mock data initialized in localStorage!');
    console.log('📊 Categories:', mockCategories.length);
    console.log('📦 Inventory Parts:', mockInventoryParts.length);
    console.log('🚁 Drone Types:', mockDroneTypes.length);
    console.log('✈️ Drones:', mockDrones.length);
    console.log('📋 AE Requests:', mockAERequests.length);
  }
};

// Get data from localStorage
export const getMockCategories = () => JSON.parse(localStorage.getItem('mockCategories') || '[]');
export const getMockInventoryParts = () => JSON.parse(localStorage.getItem('mockInventoryParts') || '[]');
export const getMockDroneTypes = () => JSON.parse(localStorage.getItem('mockDroneTypes') || '[]');
export const getMockDrones = () => JSON.parse(localStorage.getItem('mockDrones') || '[]');
export const getMockAERequests = () => JSON.parse(localStorage.getItem('mockAERequests') || '[]');

// Update data in localStorage
export const updateMockAERequests = (requests: any[]) => {
  localStorage.setItem('mockAERequests', JSON.stringify(requests));
};

export const updateMockInventoryParts = (parts: any[]) => {
  localStorage.setItem('mockInventoryParts', JSON.stringify(parts));
};
