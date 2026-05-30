/**
 * Seed Dummy Data for LocalStorage
 * This utility seeds sample invoice and AO data to localStorage for testing
 * 
 * Usage: Import and call seedDummyData() in your App.tsx or main component
 */

export const seedDummyData = () => {
  // Check if data already exists
  const existingInvoices = localStorage.getItem('invoiceHistory');
  const existingAOs = localStorage.getItem('aoHistory');

  // Only seed if data doesn't exist
  if (!existingInvoices) {
    const invoiceHistory = [
      {
        id: "inv-001-" + Date.now(),
        type: "Invoice",
        invoiceNumber: "SAPL/25-26/0001",
        date: "24-06-2025",
        time: "10:30:00 AM",
        location: "Andhra Pradesh",
        billTo: "CENTURION INSTITUTE OF TECHNOLOGY",
        address: "PLOT NO.166 and 167, RAMACHANDRAPUR, JATANI, Khordha, Odisha, 752050",
        gstin: "21AAKCS0752B1Z8",
        state: "21-Odisha",
        items: [
          {
            description: "RealFlight Evolution RC Flight Simulator Software with Interlink DX Controller (RFL2000) - Air/Heli Simulators Compatible With VR",
            quantity: 5,
            unitPrice: 29200.00,
            gst: 18
          }
        ],
        bankName: "AXIS BANK",
        accountNumber: "924020008065248",
        ifscCode: "UTIB0003240",
        notes: "Thanks for doing business with us!",
        status: "Generated"
      },
      {
        id: "inv-002-" + Date.now(),
        type: "Invoice",
        invoiceNumber: "SAPL/25-26/0002",
        date: "25-06-2025",
        time: "02:15:00 PM",
        location: "Andhra Pradesh",
        billTo: "TECH INNOVATIONS PVT LTD",
        address: "Plot 45, Industrial Area, Sector 12, Hyderabad, Telangana, 500032",
        gstin: "36AABCT1234F1Z5",
        state: "36-Telangana",
        items: [
          {
            description: "DJI Mavic 3 Pro Drone with Camera",
            quantity: 2,
            unitPrice: 185000.00,
            gst: 18
          },
          {
            description: "Extra Battery Pack (3S 5000mAh)",
            quantity: 4,
            unitPrice: 8500.00,
            gst: 18
          }
        ],
        bankName: "AXIS BANK",
        accountNumber: "924020008065248",
        ifscCode: "UTIB0003240",
        notes: "Thanks for doing business with us!",
        status: "Generated"
      },
      {
        id: "inv-003-" + Date.now(),
        type: "Invoice",
        invoiceNumber: "SAPL/25-26/0003",
        date: "26-06-2025",
        time: "09:45:00 AM",
        location: "Andhra Pradesh",
        billTo: "AERONAUTICS RESEARCH LAB",
        address: "Building 12, IIT Campus, Powai, Mumbai, Maharashtra, 400076",
        gstin: "27AABCD5678M1ZN",
        state: "27-Maharashtra",
        items: [
          {
            description: "Pixhawk 4 Flight Controller with GPS Module",
            quantity: 8,
            unitPrice: 18500.00,
            gst: 18
          },
          {
            description: "4S 5000mAh 60C LiPo Battery Pack",
            quantity: 16,
            unitPrice: 5600.00,
            gst: 18
          },
          {
            description: "Carbon Fiber Propeller Set (9450)",
            quantity: 10,
            unitPrice: 1200.00,
            gst: 18
          }
        ],
        bankName: "AXIS BANK",
        accountNumber: "924020008065248",
        ifscCode: "UTIB0003240",
        notes: "Thanks for doing business with us!",
        status: "Generated"
      }
    ];

    localStorage.setItem('invoiceHistory', JSON.stringify(invoiceHistory));
    console.log('✅ Invoice dummy data loaded!');
  }

  if (!existingAOs) {
    const aoHistory = [
      {
        id: "ao-001-" + Date.now(),
        type: "AO",
        invoiceNumber: "SAPL/25-26/AO/0001",
        date: "27-06-2025",
        time: "11:00:00 AM",
        location: "Bhubaneswar",
        customerName: "DEFENSE RESEARCH CENTER",
        address: "Building 23, DRDO Complex, Bangalore, Karnataka, 560037",
        gstin: "29AABCD1234E1ZF",
        state: "29-Karnataka",
        items: [
          {
            description: "Advanced Flight Controller System with Telemetry",
            quantity: 10,
            unitPrice: 45000.00,
            gst: 18
          },
          {
            description: "High-Resolution FPV Camera Module",
            quantity: 10,
            unitPrice: 15500.00,
            gst: 18
          }
        ],
        bankName: "AXIS BANK",
        accountNumber: "924020008065248",
        ifscCode: "UTIB0003240",
        notes: "Government procurement order. Tax invoice required.",
        status: "Generated"
      },
      {
        id: "ao-002-" + Date.now(),
        type: "AO",
        invoiceNumber: "SAPL/25-26/AO/0002",
        date: "28-06-2025",
        time: "03:30:00 PM",
        location: "Bhubaneswar",
        customerName: "NATIONAL AEROSPACE LABORATORIES",
        address: "HAL Airport Road, Kodihalli, Bangalore, Karnataka, 560017",
        gstin: "29AABCN1234L1ZG",
        state: "29-Karnataka",
        items: [
          {
            description: "Hexacopter Complete Frame Kit (680mm)",
            quantity: 5,
            unitPrice: 28000.00,
            gst: 18
          },
          {
            description: "2216 900KV Brushless Motor Set (6 pcs)",
            quantity: 5,
            unitPrice: 16800.00,
            gst: 18
          },
          {
            description: "30A Electronic Speed Controller (6 pcs)",
            quantity: 5,
            unitPrice: 7200.00,
            gst: 18
          }
        ],
        bankName: "AXIS BANK",
        accountNumber: "924020008065248",
        ifscCode: "UTIB0003240",
        notes: "Research and Development Project - Phase 2",
        status: "Generated"
      },
      {
        id: "ao-003-" + Date.now(),
        type: "AO",
        invoiceNumber: "SAPL/25-26/AO/0003",
        date: "29-06-2025",
        time: "10:15:00 AM",
        location: "Bhubaneswar",
        customerName: "AGRICULTURAL DRONE SERVICES",
        address: "Plot 234, Agricultural Park, Pune, Maharashtra, 411028",
        gstin: "27AABCA9876P1ZH",
        state: "27-Maharashtra",
        items: [
          {
            description: "Agricultural Spray Drone Complete Kit (1000mm)",
            quantity: 3,
            unitPrice: 125000.00,
            gst: 18
          },
          {
            description: "6S 6000mAh High Capacity Battery Pack",
            quantity: 9,
            unitPrice: 8900.00,
            gst: 18
          },
          {
            description: "GPS Module with RTK Precision",
            quantity: 3,
            unitPrice: 12500.00,
            gst: 18
          }
        ],
        bankName: "AXIS BANK",
        accountNumber: "924020008065248",
        ifscCode: "UTIB0003240",
        notes: "Commercial agriculture deployment. Training included.",
        status: "Generated"
      }
    ];

    localStorage.setItem('aoHistory', JSON.stringify(aoHistory));
    console.log('✅ AO dummy data loaded!');
  }

  console.log('🎉 Dummy data seeding completed!');
};

// Auto-seed on development environment
export const autoSeedIfNeeded = () => {
  // Only auto-seed in development
  if (import.meta.env.DEV) {
    const hasSeeded = localStorage.getItem('dummyDataSeeded');
    
    if (!hasSeeded) {
      seedDummyData();
      localStorage.setItem('dummyDataSeeded', 'true');
      console.log('🌱 Auto-seeded dummy data for development');
    }
  }
};
