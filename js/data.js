// PickMi Cab Booking Website - Master Data & Constants
// Conforming to Product & UX Documentation v1.0

// Official 28 States and 8 Union Territories of India
export const ALL_INDIAN_STATES = [
  // 28 States
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',

  // 8 Union Territories
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

export const STATE_CODE_MAP = {
  'AP': 'Andhra Pradesh',
  'AR': 'Arunachal Pradesh',
  'AS': 'Assam',
  'BR': 'Bihar',
  'CG': 'Chhattisgarh',
  'CT': 'Chhattisgarh',
  'GA': 'Goa',
  'GJ': 'Gujarat',
  'HR': 'Haryana',
  'HP': 'Himachal Pradesh',
  'JH': 'Jharkhand',
  'KA': 'Karnataka',
  'KL': 'Kerala',
  'MP': 'Madhya Pradesh',
  'MH': 'Maharashtra',
  'MN': 'Manipur',
  'ML': 'Meghalaya',
  'MZ': 'Mizoram',
  'NL': 'Nagaland',
  'OD': 'Odisha',
  'OR': 'Odisha',
  'PB': 'Punjab',
  'RJ': 'Rajasthan',
  'SK': 'Sikkim',
  'TN': 'Tamil Nadu',
  'TS': 'Telangana',
  'TG': 'Telangana',
  'TR': 'Tripura',
  'UP': 'Uttar Pradesh',
  'UK': 'Uttarakhand',
  'UA': 'Uttarakhand',
  'WB': 'West Bengal',
  'AN': 'Andaman and Nicobar Islands',
  'CH': 'Chandigarh',
  'DH': 'Dadra and Nagar Haveli and Daman and Diu',
  'DD': 'Dadra and Nagar Haveli and Daman and Diu',
  'DN': 'Dadra and Nagar Haveli and Daman and Diu',
  'DL': 'Delhi',
  'JK': 'Jammu and Kashmir',
  'LA': 'Ladakh',
  'LD': 'Lakshadweep',
  'PY': 'Puducherry'
};

export const LOCATION_MASTER = [
  // Chennai & Tamil Nadu
  { id: 'loc-1', label: 'Anna Nagar, Chennai, Tamil Nadu', area: 'Anna Nagar', city: 'Chennai', state: 'Tamil Nadu', type: 'area', lat: 13.0850, lon: 80.2101 },
  { id: 'loc-2', label: 'T. Nagar, Chennai, Tamil Nadu', area: 'T. Nagar', city: 'Chennai', state: 'Tamil Nadu', type: 'area', lat: 13.0418, lon: 80.2341 },
  { id: 'loc-3', label: 'Chennai International Airport (MAA), Chennai, Tamil Nadu', area: 'Meenambakkam', city: 'Chennai', state: 'Tamil Nadu', type: 'airport', code: 'MAA', lat: 12.9941, lon: 80.1709 },
  { id: 'loc-4', label: 'Chennai Central Railway Station, Chennai, Tamil Nadu', area: 'Park Town', city: 'Chennai', state: 'Tamil Nadu', type: 'station', lat: 13.0827, lon: 80.2757 },
  { id: 'loc-5', label: 'OMR - IT Corridor, Sholinganallur, Chennai, Tamil Nadu', area: 'Sholinganallur', city: 'Chennai', state: 'Tamil Nadu', type: 'area', lat: 12.9010, lon: 80.2279 },
  { id: 'loc-6', label: 'Velachery, Chennai, Tamil Nadu', area: 'Velachery', city: 'Chennai', state: 'Tamil Nadu', type: 'area', lat: 12.9815, lon: 80.2180 },
  { id: 'loc-7', label: 'Adyar, Chennai, Tamil Nadu', area: 'Adyar', city: 'Chennai', state: 'Tamil Nadu', type: 'area', lat: 13.0012, lon: 80.2565 },
  { id: 'loc-8', label: 'Tambaram, Chennai, Tamil Nadu', area: 'Tambaram', city: 'Chennai', state: 'Tamil Nadu', type: 'area', lat: 12.9249, lon: 80.1000 },
  { id: 'loc-9', label: 'Porur, Chennai, Tamil Nadu', area: 'Porur', city: 'Chennai', state: 'Tamil Nadu', type: 'area', lat: 13.0382, lon: 80.1565 },
  { id: 'loc-10', label: 'Guindy, Chennai, Tamil Nadu', area: 'Guindy', city: 'Chennai', state: 'Tamil Nadu', type: 'area', lat: 13.0067, lon: 80.2025 },
  { id: 'loc-11', label: 'Vadapalani, Chennai, Tamil Nadu', area: 'Vadapalani', city: 'Chennai', state: 'Tamil Nadu', type: 'area', lat: 13.0500, lon: 80.2121 },
  { id: 'loc-12', label: 'Ambattur, Chennai, Tamil Nadu', area: 'Ambattur', city: 'Chennai', state: 'Tamil Nadu', type: 'area', lat: 13.1143, lon: 80.1548 },
  { id: 'loc-13', label: 'Nungambakkam, Chennai, Tamil Nadu', area: 'Nungambakkam', city: 'Chennai', state: 'Tamil Nadu', type: 'area', lat: 13.0569, lon: 80.2425 },
  { id: 'loc-14', label: 'Pondicherry (Puducherry), Puducherry', area: 'White Town', city: 'Pondicherry', state: 'Puducherry', type: 'city', lat: 11.9416, lon: 79.8083 },
  { id: 'loc-14-pud', label: 'Puducherry (Pondicherry / Pondy / Pudarcy), Puducherry', area: 'White Town / Promenade Beach', city: 'Puducherry', state: 'Puducherry', type: 'city', lat: 11.9416, lon: 79.8083 },
  { id: 'loc-15', label: 'Coimbatore, Tamil Nadu', area: 'Gandhipuram', city: 'Coimbatore', state: 'Tamil Nadu', type: 'city', lat: 11.0168, lon: 76.9558 },
  { id: 'loc-16', label: 'Coimbatore International Airport (CJB), Tamil Nadu', area: 'Peelamedu', city: 'Coimbatore', state: 'Tamil Nadu', type: 'airport', code: 'CJB', lat: 11.0298, lon: 77.0434 },
  { id: 'loc-17', label: 'Madurai, Tamil Nadu', area: 'Meenakshi Temple', city: 'Madurai', state: 'Tamil Nadu', type: 'city', lat: 9.9252, lon: 78.1198 },
  { id: 'loc-18', label: 'Tiruchirappalli (Trichy), Tamil Nadu', area: 'Central Trichy', city: 'Tiruchirappalli', state: 'Tamil Nadu', type: 'city', lat: 10.7905, lon: 78.7047 },
  { id: 'loc-19', label: 'Salem, Tamil Nadu', area: 'Salem Town', city: 'Salem', state: 'Tamil Nadu', type: 'city', lat: 11.6643, lon: 78.1460 },
  { id: 'loc-20', label: 'Tirunelveli, Tamil Nadu', area: 'Palayamkottai', city: 'Tirunelveli', state: 'Tamil Nadu', type: 'city', lat: 8.7139, lon: 77.7567 },
  { id: 'loc-21', label: 'Vellore, Tamil Nadu', area: 'Katpadi', city: 'Vellore', state: 'Tamil Nadu', type: 'city', lat: 12.9165, lon: 79.1325 },
  { id: 'loc-22', label: 'Mahabalipuram, Chengalpattu, Tamil Nadu', area: 'Beach Road', city: 'Mahabalipuram', state: 'Tamil Nadu', type: 'city', lat: 12.6269, lon: 80.1927 },
  { id: 'loc-23', label: 'Kanchipuram, Tamil Nadu', area: 'Silk City', city: 'Kanchipuram', state: 'Tamil Nadu', type: 'city', lat: 12.8342, lon: 79.7036 },
  { id: 'loc-24', label: 'Ooty (Udhagamandalam), Nilgiris, Tamil Nadu', area: 'Charring Cross', city: 'Ooty', state: 'Tamil Nadu', type: 'city', lat: 11.4102, lon: 76.6950 },
  { id: 'loc-25', label: 'Kodaikanal, Dindigul, Tamil Nadu', area: 'Lake Road', city: 'Kodaikanal', state: 'Tamil Nadu', type: 'city', lat: 10.2381, lon: 77.4892 },
  { id: 'loc-26', label: 'Hosur, Krishnagiri, Tamil Nadu', area: 'SIPCOT', city: 'Hosur', state: 'Tamil Nadu', type: 'city', lat: 12.7409, lon: 77.8253 },
  { id: 'loc-27', label: 'Kanyakumari, Tamil Nadu', area: 'Cape Comorin', city: 'Kanyakumari', state: 'Tamil Nadu', type: 'city', lat: 8.0883, lon: 77.5385 },
  { id: 'loc-28', label: 'Tiruvannamalai, Tamil Nadu', area: 'Girivalam Path / Temple', city: 'Tiruvannamalai', state: 'Tamil Nadu', type: 'city', lat: 12.2253, lon: 79.0747 },
  { id: 'loc-29', label: 'Thiruvannamalai (Arunachalam), Tamil Nadu', area: 'Arunachaleswarar Temple', city: 'Thiruvannamalai', state: 'Tamil Nadu', type: 'city', lat: 12.2253, lon: 79.0747 },

  // Bengaluru & Karnataka
  { id: 'loc-30-blr', label: 'Bangalore (Bengaluru), Karnataka', area: 'Majestic / Central City', city: 'Bangalore', state: 'Karnataka', type: 'city', lat: 12.9716, lon: 77.5946 },
  { id: 'loc-30', label: 'Koramangala, Bengaluru, Karnataka', area: 'Koramangala', city: 'Bengaluru', state: 'Karnataka', type: 'area', lat: 12.9352, lon: 77.6245 },
  { id: 'loc-31', label: 'Indiranagar, Bengaluru, Karnataka', area: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka', type: 'area', lat: 12.9784, lon: 77.6408 },
  { id: 'loc-32', label: 'Kempegowda International Airport (BLR), Bengaluru, Karnataka', area: 'Devanahalli', city: 'Bengaluru', state: 'Karnataka', type: 'airport', code: 'BLR', lat: 13.1986, lon: 77.7066 },
  { id: 'loc-33', label: 'Whitefield, Bengaluru, Karnataka', area: 'Whitefield', city: 'Bengaluru', state: 'Karnataka', type: 'area', lat: 12.9698, lon: 77.7500 },
  { id: 'loc-34', label: 'Electronic City Phase 1, Bengaluru, Karnataka', area: 'Electronic City', city: 'Bengaluru', state: 'Karnataka', type: 'area', lat: 12.8399, lon: 77.6770 },
  { id: 'loc-35', label: 'HSR Layout, Bengaluru, Karnataka', area: 'HSR Layout', city: 'Bengaluru', state: 'Karnataka', type: 'area', lat: 12.9121, lon: 77.6446 },
  { id: 'loc-36', label: 'Jayanagar, Bengaluru, Karnataka', area: 'Jayanagar', city: 'Bengaluru', state: 'Karnataka', type: 'area', lat: 12.9308, lon: 77.5838 },
  { id: 'loc-37', label: 'JP Nagar, Bengaluru, Karnataka', area: 'JP Nagar', city: 'Bengaluru', state: 'Karnataka', type: 'area', lat: 12.9063, lon: 77.5857 },
  { id: 'loc-38', label: 'Hebbal, Bengaluru, Karnataka', area: 'Hebbal', city: 'Bengaluru', state: 'Karnataka', type: 'area', lat: 13.0358, lon: 77.5970 },
  { id: 'loc-39', label: 'Marathahalli, Bengaluru, Karnataka', area: 'Marathahalli', city: 'Bengaluru', state: 'Karnataka', type: 'area', lat: 12.9591, lon: 77.6974 },
  { id: 'loc-40', label: 'BTM Layout, Bengaluru, Karnataka', area: 'BTM Layout', city: 'Bengaluru', state: 'Karnataka', type: 'area', lat: 12.9166, lon: 77.6101 },
  { id: 'loc-41', label: 'Rajajinagar, Bengaluru, Karnataka', area: 'Rajajinagar', city: 'Bengaluru', state: 'Karnataka', type: 'area', lat: 12.9982, lon: 77.5530 },
  { id: 'loc-42', label: 'Malleshwaram, Bengaluru, Karnataka', area: 'Malleshwaram', city: 'Bengaluru', state: 'Karnataka', type: 'area', lat: 13.0031, lon: 77.5643 },
  { id: 'loc-43', label: 'Bellandur, Bengaluru, Karnataka', area: 'Bellandur', city: 'Bengaluru', state: 'Karnataka', type: 'area', lat: 12.9260, lon: 77.6762 },
  { id: 'loc-44', label: 'Sarjapur Road, Bengaluru, Karnataka', area: 'Sarjapur Road', city: 'Bengaluru', state: 'Karnataka', type: 'area', lat: 12.9100, lon: 77.6850 },
  { id: 'loc-45', label: 'Yelahanka, Bengaluru, Karnataka', area: 'Yelahanka', city: 'Bengaluru', state: 'Karnataka', type: 'area', lat: 13.1007, lon: 77.5963 },
  { id: 'loc-46', label: 'Mysuru (Mysore), Karnataka', area: 'Palace Road', city: 'Mysuru', state: 'Karnataka', type: 'city', lat: 12.2958, lon: 76.6394 },
  { id: 'loc-47', label: 'Coorg (Madikeri), Karnataka', area: 'Hill Town', city: 'Coorg', state: 'Karnataka', type: 'city', lat: 12.4244, lon: 75.7382 },
  { id: 'loc-48', label: 'Mangaluru (Mangalore), Karnataka', area: 'Hampankatta', city: 'Mangaluru', state: 'Karnataka', type: 'city', lat: 12.9141, lon: 74.8560 },
  { id: 'loc-49', label: 'Hubballi-Dharwad, Karnataka', area: 'Vidyanagar', city: 'Hubballi', state: 'Karnataka', type: 'city', lat: 15.3647, lon: 75.1240 },
  { id: 'loc-50', label: 'Chikmagalur, Karnataka', area: 'Mullayanagiri Rd', city: 'Chikmagalur', state: 'Karnataka', type: 'city', lat: 13.3153, lon: 75.7754 },
  { id: 'loc-51', label: 'Udupi, Karnataka', area: 'Krishna Temple', city: 'Udupi', state: 'Karnataka', type: 'city', lat: 13.3409, lon: 74.7421 },

  // Mumbai & Maharashtra
  { id: 'loc-55', label: 'Bandra West, Mumbai, Maharashtra', area: 'Bandra West', city: 'Mumbai', state: 'Maharashtra', type: 'area', lat: 19.0596, lon: 72.8295 },
  { id: 'loc-56', label: 'Chhatrapati Shivaji Maharaj Airport T2 (BOM), Mumbai, Maharashtra', area: 'Andheri East', city: 'Mumbai', state: 'Maharashtra', type: 'airport', code: 'BOM', lat: 19.0896, lon: 72.8656 },
  { id: 'loc-57', label: 'BKC (Bandra Kurla Complex), Mumbai, Maharashtra', area: 'Bandra East', city: 'Mumbai', state: 'Maharashtra', type: 'area', lat: 19.0657, lon: 72.8687 },
  { id: 'loc-58', label: 'Andheri West, Mumbai, Maharashtra', area: 'Andheri West', city: 'Mumbai', state: 'Maharashtra', type: 'area', lat: 19.1197, lon: 72.8464 },
  { id: 'loc-59', label: 'South Mumbai (Colaba & Fort), Mumbai, Maharashtra', area: 'Colaba', city: 'Mumbai', state: 'Maharashtra', type: 'area', lat: 18.9067, lon: 72.8147 },
  { id: 'loc-60', label: 'Thane West, Maharashtra', area: 'Thane', city: 'Thane', state: 'Maharashtra', type: 'city', lat: 19.2183, lon: 72.9781 },
  { id: 'loc-61', label: 'Navi Mumbai (Vashi), Maharashtra', area: 'Vashi', city: 'Navi Mumbai', state: 'Maharashtra', type: 'city', lat: 19.0771, lon: 72.9986 },
  { id: 'loc-62', label: 'Pune (Shivajinagar / Hinjewadi), Maharashtra', area: 'Hinjewadi', city: 'Pune', state: 'Maharashtra', type: 'city', lat: 18.5204, lon: 73.8567 },
  { id: 'loc-63', label: 'Pune International Airport (PNQ), Maharashtra', area: 'Lohegaon', city: 'Pune', state: 'Maharashtra', type: 'airport', code: 'PNQ', lat: 18.5822, lon: 73.9197 },
  { id: 'loc-64', label: 'Lonavala, Pune, Maharashtra', area: 'Main Road', city: 'Lonavala', state: 'Maharashtra', type: 'city', lat: 18.7557, lon: 73.4091 },
  { id: 'loc-65', label: 'Nashik, Maharashtra', area: 'College Road', city: 'Nashik', state: 'Maharashtra', type: 'city', lat: 19.9975, lon: 73.7898 },
  { id: 'loc-66', label: 'Shirdi, Ahmednagar, Maharashtra', area: 'Sai Temple', city: 'Shirdi', state: 'Maharashtra', type: 'city', lat: 19.7645, lon: 74.4762 },
  { id: 'loc-67', label: 'Nagpur, Maharashtra', area: 'Civil Lines', city: 'Nagpur', state: 'Maharashtra', type: 'city', lat: 21.1458, lon: 79.0882 },

  // Delhi NCR & North India
  { id: 'loc-70', label: 'Indira Gandhi International Airport T3 (DEL), New Delhi, Delhi', area: 'Palam', city: 'New Delhi', state: 'Delhi', type: 'airport', code: 'DEL', lat: 28.5562, lon: 77.1000 },
  { id: 'loc-71', label: 'Connaught Place, Central Delhi, Delhi', area: 'CP Inner Circle', city: 'New Delhi', state: 'Delhi', type: 'area', lat: 28.6315, lon: 77.2167 },
  { id: 'loc-72', label: 'Cyber Hub DLF Phase 2, Gurugram, Haryana', area: 'Cyber City', city: 'Gurugram', state: 'Haryana', type: 'area', lat: 28.4950, lon: 77.0895 },
  { id: 'loc-73', label: 'Sector 62, Noida, Uttar Pradesh', area: 'Institutional Area', city: 'Noida', state: 'Uttar Pradesh', type: 'area', lat: 28.6258, lon: 77.3644 },
  { id: 'loc-74', label: 'Taj Mahal / Agra, Uttar Pradesh', area: 'Taj East Gate', city: 'Agra', state: 'Uttar Pradesh', type: 'city', lat: 27.1767, lon: 78.0081 },
  { id: 'loc-75', label: 'Jaipur (Pink City), Rajasthan', area: 'Hawa Mahal', city: 'Jaipur', state: 'Rajasthan', type: 'city', lat: 26.9124, lon: 75.7873 },
  { id: 'loc-76', label: 'Udaipur (City of Lakes), Rajasthan', area: 'Lake Pichola', city: 'Udaipur', state: 'Rajasthan', type: 'city', lat: 24.5854, lon: 73.7125 },
  { id: 'loc-77', label: 'Lucknow, Uttar Pradesh', area: 'Hazratganj', city: 'Lucknow', state: 'Uttar Pradesh', type: 'city', lat: 26.8467, lon: 80.9462 },
  { id: 'loc-78', label: 'Varanasi (Kashi), Uttar Pradesh', area: 'Dashashwamedh', city: 'Varanasi', state: 'Uttar Pradesh', type: 'city', lat: 25.3176, lon: 82.9739 },
  { id: 'loc-79', label: 'Chandigarh, Chandigarh UT', area: 'Sector 17', city: 'Chandigarh', state: 'Chandigarh', type: 'city', lat: 30.7333, lon: 76.7794 },
  { id: 'loc-80', label: 'Dehradun, Uttarakhand', area: 'Rajpur Road', city: 'Dehradun', state: 'Uttarakhand', type: 'city', lat: 30.3165, lon: 78.0322 },
  { id: 'loc-81', label: 'Rishikesh / Haridwar, Uttarakhand', area: 'Laxman Jhula', city: 'Rishikesh', state: 'Uttarakhand', type: 'city', lat: 30.0869, lon: 78.2676 },

  // Hyderabad & Telangana / Andhra Pradesh
  { id: 'loc-85', label: 'Rajiv Gandhi International Airport (HYD), Shamshabad, Telangana', area: 'Shamshabad', city: 'Hyderabad', state: 'Telangana', type: 'airport', code: 'HYD', lat: 17.2403, lon: 78.4294 },
  { id: 'loc-86', label: 'Hitec City - Cyber Towers, Hyderabad, Telangana', area: 'Madhapur', city: 'Hyderabad', state: 'Telangana', type: 'area', lat: 17.4474, lon: 78.3762 },
  { id: 'loc-87', label: 'Banjara Hills, Hyderabad, Telangana', area: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', type: 'area', lat: 17.4156, lon: 78.4350 },
  { id: 'loc-88', label: 'Gachibowli, Hyderabad, Telangana', area: 'Gachibowli', city: 'Hyderabad', state: 'Telangana', type: 'area', lat: 17.4401, lon: 78.3489 },
  { id: 'loc-89', label: 'Secunderabad Railway Station, Hyderabad, Telangana', area: 'Secunderabad', city: 'Hyderabad', state: 'Telangana', type: 'station', lat: 17.4399, lon: 78.5017 },
  { id: 'loc-90', label: 'Vijayawada, Andhra Pradesh', area: 'Benz Circle', city: 'Vijayawada', state: 'Andhra Pradesh', type: 'city', lat: 16.5062, lon: 80.6480 },
  { id: 'loc-91', label: 'Visakhapatnam (Vizag), Andhra Pradesh', area: 'RK Beach', city: 'Visakhapatnam', state: 'Andhra Pradesh', type: 'city', lat: 17.6868, lon: 83.2185 },
  { id: 'loc-92', label: 'Tirupati, Andhra Pradesh', area: 'Alipiri / Balaji', city: 'Tirupati', state: 'Andhra Pradesh', type: 'city', lat: 13.6288, lon: 79.4192 },

  // Kerala
  { id: 'loc-95', label: 'Cochin International Airport (COK), Nedumbassery, Kerala', area: 'Nedumbassery', city: 'Kochi', state: 'Kerala', type: 'airport', code: 'COK', lat: 10.1518, lon: 76.3930 },
  { id: 'loc-96', label: 'Kochi (Cochin / Ernakulam), Kerala', area: 'MG Road', city: 'Kochi', state: 'Kerala', type: 'city', lat: 9.9312, lon: 76.2673 },
  { id: 'loc-97', label: 'Thiruvananthapuram (Trivandrum), Kerala', area: 'East Fort', city: 'Thiruvananthapuram', state: 'Kerala', type: 'city', lat: 8.5241, lon: 76.9366 },
  { id: 'loc-98', label: 'Munnar, Idukki, Kerala', area: 'Tea Estates', city: 'Munnar', state: 'Kerala', type: 'city', lat: 10.0889, lon: 77.0595 },
  { id: 'loc-99', label: 'Kozhikode (Calicut), Kerala', area: 'Beach Road', city: 'Kozhikode', state: 'Kerala', type: 'city', lat: 11.2588, lon: 75.7804 },

  // Goa & Gujarat
  { id: 'loc-105', label: 'Goa (Panaji & North Goa Beaches), Goa', area: 'Panaji', city: 'Goa', state: 'Goa', type: 'city', lat: 15.4909, lon: 73.8278 },
  { id: 'loc-106', label: 'Goa Dabolim Airport (GOI) / Mopa (GOX), Goa', area: 'Dabolim', city: 'Goa', state: 'Goa', type: 'airport', code: 'GOI', lat: 15.3808, lon: 73.8314 },
  { id: 'loc-107', label: 'Ahmedabad (Sabarmati / SG Highway), Gujarat', area: 'SG Highway', city: 'Ahmedabad', state: 'Gujarat', type: 'city', lat: 23.0225, lon: 72.5714 },
  { id: 'loc-108', label: 'Surat, Gujarat', area: 'Athwa', city: 'Surat', state: 'Gujarat', type: 'city', lat: 21.1702, lon: 72.8311 },

  // Kolkata & East
  { id: 'loc-110', label: 'Kolkata (Park Street / Salt Lake), West Bengal', area: 'Salt Lake', city: 'Kolkata', state: 'West Bengal', type: 'city', lat: 22.5726, lon: 88.3639 },
  { id: 'loc-111', label: 'Netaji Subhash Chandra Bose Airport (CCU), Kolkata, West Bengal', area: 'Dum Dum', city: 'Kolkata', state: 'West Bengal', type: 'airport', code: 'CCU', lat: 22.6547, lon: 88.4467 }
];

export const VEHICLE_CATEGORIES = [
  {
    id: 'hatchback',
    categoryName: 'Hatchback',
    models: 'Swift, Indica or similar',
    seats: 4,
    luggage: 2,
    hasAc: true,
    tag: 'Budget & Compact',
    badge: 'Popular',
    icon: 'car',
    minKmOneWay: 130,
    minKmPerDayRound: 300,
    driverAllowanceRound: 300,
    driverAllowanceOneway: 300,
    interstateCharge: 400,
    rentalExtraKmRate: 14,
    rentalExtraHrRate: 120,
    rentalPackageFares: {
      'rent-2h20k': 799,
      'rent-4h40k': 1399,
      'rent-8h80k': 2399,
      'rent-12h120k': 3299
    },
    baseRatePerKm: {
      incity: 15,
      intercity_oneway: 14,
      intercity_round: 13,
      airport: 18,
      rental_extra_km: 14
    },
    baseFareMin: {
      incity: 220,
      intercity_oneway: 1820,
      intercity_round: 3900,
      airport: 650
    },
    inclusions: ['Fuel charges', 'Air conditioning', 'Trained driver', 'Free pickup'],
    exclusions: ['Tolls & Parking charges (Extra based on your route)', 'Night allowance if after 10 PM (₹250)']
  },
  {
    id: 'sedan',
    categoryName: 'Sedan',
    models: 'Dzire, Etios or similar',
    seats: 4,
    luggage: 3,
    hasAc: true,
    tag: 'Spacious & Comfortable',
    badge: 'Best Value',
    icon: 'car-side',
    minKmOneWay: 130,
    minKmPerDayRound: 300,
    driverAllowanceRound: 400,
    driverAllowanceOneway: 400,
    interstateCharge: 500,
    rentalExtraKmRate: 16,
    rentalExtraHrRate: 150,
    rentalPackageFares: {
      'rent-2h20k': 949,
      'rent-4h40k': 1649,
      'rent-8h80k': 2799,
      'rent-12h120k': 3899
    },
    baseRatePerKm: {
      incity: 18,
      intercity_oneway: 15,
      intercity_round: 14,
      airport: 21,
      rental_extra_km: 16
    },
    baseFareMin: {
      incity: 290,
      intercity_oneway: 1950,
      intercity_round: 4200,
      airport: 820
    },
    inclusions: ['Fuel charges', 'Spacious boot space', 'AC & Top Rated Driver', 'Free pickup'],
    exclusions: ['Tolls & Parking charges (Extra based on your route)', 'State entry permit if non-commercial cross-border']
  },
  {
    id: 'suv',
    categoryName: 'SUV',
    models: 'Ertiga, Innova or similar',
    seats: 6,
    luggage: 4,
    hasAc: true,
    tag: 'Extra Space for Families',
    badge: 'Family Favorite',
    icon: 'truck',
    minKmOneWay: 130,
    minKmPerDayRound: 300,
    driverAllowanceRound: 500,
    driverAllowanceOneway: 500,
    interstateCharge: 1000,
    rentalExtraKmRate: 20,
    rentalExtraHrRate: 200,
    rentalPackageFares: {
      'rent-2h20k': 1499,
      'rent-4h40k': 2499,
      'rent-8h80k': 4199,
      'rent-12h120k': 5699
    },
    baseRatePerKm: {
      incity: 24,
      intercity_oneway: 20,
      intercity_round: 19,
      airport: 28,
      rental_extra_km: 20
    },
    baseFareMin: {
      incity: 440,
      intercity_oneway: 2600,
      intercity_round: 5700,
      airport: 1180
    },
    inclusions: ['6 passenger seating', 'Carrier/extra luggage space', 'Dual AC blowers', 'All fuel included'],
    exclusions: ['Tolls & Parking charges (Extra based on your route)', 'Driver night stay if multiday outstation (₹350/night)']
  },
  {
    id: 'innova',
    categoryName: 'Toyota Innova',
    models: 'Toyota Innova (7-Seater)',
    seats: 7,
    luggage: 5,
    hasAc: true,
    tag: 'Spacious & Reliable Highway Cruiser',
    badge: 'Spacious 7-Seater',
    icon: 'truck',
    minKmOneWay: 130,
    minKmPerDayRound: 300,
    driverAllowanceRound: 600,
    driverAllowanceOneway: 600,
    interstateCharge: 1200,
    rentalExtraKmRate: 23,
    rentalExtraHrRate: 250,
    rentalPackageFares: {
      'rent-2h20k': 1899,
      'rent-4h40k': 3099,
      'rent-8h80k': 5199,
      'rent-12h120k': 6999
    },
    baseRatePerKm: {
      incity: 28,
      intercity_oneway: 21,
      intercity_round: 20,
      airport: 32,
      rental_extra_km: 23
    },
    baseFareMin: {
      incity: 580,
      intercity_oneway: 2730,
      intercity_round: 6000,
      airport: 1450
    },
    inclusions: ['7 passenger seating', 'Spacious boot & carrier', 'Highway comfortable ride', 'Fuel & AC included'],
    exclusions: ['Tolls & Parking charges (Extra based on your route)', 'Driver night allowance if multiday (₹350)']
  },
  {
    id: 'innova_crysta',
    categoryName: 'Luxury',
    models: 'Innova Crysta Executive',
    seats: 7,
    luggage: 5,
    hasAc: true,
    tag: 'Ultimate Highway Luxury & Captain Seats',
    badge: 'Executive Class',
    icon: 'shield',
    minKmOneWay: 130,
    minKmPerDayRound: 300,
    driverAllowanceRound: 700,
    driverAllowanceOneway: 700,
    interstateCharge: 1500,
    rentalExtraKmRate: 27,
    rentalExtraHrRate: 300,
    rentalPackageFares: {
      'rent-2h20k': 2399,
      'rent-4h40k': 3799,
      'rent-8h80k': 6399,
      'rent-12h120k': 8699
    },
    baseRatePerKm: {
      incity: 34,
      intercity_oneway: 22,
      intercity_round: 21,
      airport: 38,
      rental_extra_km: 27
    },
    baseFareMin: {
      incity: 690,
      intercity_oneway: 2860,
      intercity_round: 6300,
      airport: 1750
    },
    inclusions: ['Plush recliner captain seats', 'Top rated premium chauffeur', 'Highest safety rating', 'Fuel charges'],
    exclusions: ['Tolls & Parking charges (Extra based on your route)', 'Gratuity (optional)']
  }
];

export const RENTAL_PACKAGES = [
  { id: 'rent-2h20k', hours: 2, km: 20, label: '2 Hours / 20 KMs', description: 'Quick city chores & short meetings', multiplier: 1.0, popular: false },
  { id: 'rent-4h40k', hours: 4, km: 40, label: '4 Hours / 40 KMs', description: 'Half day city shopping & multiple stops', multiplier: 1.8, popular: true },
  { id: 'rent-8h80k', hours: 8, km: 80, label: '8 Hours / 80 KMs (Full Day)', description: 'Full day business meetings & city tour', multiplier: 3.2, popular: true },
  { id: 'rent-12h120k', hours: 12, km: 120, label: '12 Hours / 120 KMs', description: 'Extended day out & late night corporate trips', multiplier: 4.5, popular: false }
];

export const PROMO_CODES = [
  { id: 'c-1', code: 'FLASH15', discountType: 'percent', value: 15, maxDiscount: 350, minAmount: 1200, desc: '15% off up to ₹350 on highway trips', validService: 'all', isActive: true },
  { id: 'c-2', code: 'PICKMI50', discountType: 'flat', value: 50, maxDiscount: 50, minAmount: 500, desc: 'Flat ₹50 off on first outstation ride', validService: 'all', isActive: true },
  { id: 'c-3', code: 'PICKFIRST', discountType: 'flat', value: 150, discount: 150, minAmount: 500, desc: 'Flat ₹150 OFF on your first cab booking with PickMi', description: 'Flat ₹150 OFF on your first cab booking with PickMi', validService: 'all', isActive: true },
  { id: 'c-4', code: 'AIRPORT50', discountType: 'flat', value: 100, discount: 100, minAmount: 600, desc: '₹100 Instant Discount on all Airport Transfers', description: '₹100 Instant Discount on all Airport Transfers', validService: 'airport', isActive: true },
  { id: 'c-5', code: 'OUTSTATION300', discountType: 'flat', value: 300, discount: 300, minAmount: 2500, desc: 'Flat ₹300 OFF on Intercity One-Way & Round Trips', description: 'Flat ₹300 OFF on Intercity One-Way & Round Trips', validService: 'intercity', isActive: true },
  { id: 'c-6', code: 'WEEKEND10', discountType: 'percent', value: 10, discountPercent: 10, maxDiscount: 200, minAmount: 400, desc: '10% discount up to ₹200 for weekend city rides', description: '10% discount up to ₹200 for weekend city rides', validService: 'incity', isActive: true }
];

export const FAQS = [
  {
    q: 'Can I search and compare cabs before logging in?',
    a: 'Yes, absolutely! PickMi follows a transparent "Search before login" policy. You can choose your service, view available vehicles, estimated arrival times, and transparent fare breakdowns without logging in. You will only be prompted for a quick 4-digit mobile OTP when proceeding to confirm your booking.'
  },
  {
    q: 'How does the Reservation Trip OTP work?',
    a: 'For scheduled outstation, airport, and rental rides, PickMi generates a secure Reservation Trip OTP visible in your trip details and sent via SMS. You only provide this OTP to your assigned driver once they arrive at your pickup location to begin the trip safely.'
  },
  {
    q: 'Are tolls, driver allowance, and GST included in the fare?',
    a: 'PickMi believes in 100% price transparency. Your booking breakdown explicitly itemizes base fare, included kilometers, toll estimates, driver allowances for outstation, and taxes. No surprise hidden charges at trip conclusion!'
  },
  {
    q: 'When will I receive my driver and vehicle details?',
    a: 'Driver and car details (driver photo, vehicle number, model, contact number) are assigned and shared ahead of pickup (typically between 30 minutes to 2 hours before scheduled pickup) with instant SMS and WhatsApp notifications.'
  },
  {
    q: 'What is the cancellation and refund policy?',
    a: 'Cancellations done at least 2 hours before scheduled pickup incur zero cancellation fees and full instant refund to source. Within 2 hours of pickup, a nominal base charge applies if a driver has already been dispatched.'
  }
];

export const SEED_TRIPS = [
  {
    id: 'PKM-88219',
    serviceType: 'intercity',
    tripType: 'oneway',
    status: 'Driver Assigned',
    statusBadge: 'Upcoming',
    driverAssigned: true,
    pickup: 'Anna Nagar, Chennai, Tamil Nadu',
    drop: 'Pondicherry (Puducherry), Tamil Nadu',
    pickupTime: 'Tomorrow, 07:00 AM',
    departureDate: '2026-10-12',
    vehicleCategory: 'Prime Sedan',
    vehicleModel: 'Maruti Suzuki Dzire (White)',
    vehicleReg: 'TN 09 BX 7421',
    passengerName: 'Karthik Prabhu',
    passengerPhone: '+91 98401 23456',
    passengerEmail: 'karthik@example.com',
    distanceKm: 152,
    fare: {
      base: 2450,
      tolls: 180,
      tax: 131,
      discount: 150,
      total: 2611,
      advancePaid: 2611,
      balanceDue: 0
    },
    paymentMethod: 'UPI (GPay / PhonePe)',
    reservationOtp: '5842',
    otpReleased: true,
    driver: {
      name: 'Murugan Selvan',
      phone: '+91 98409 ••••• (Click to call)',
      fullPhone: '+91 98409 88312',
      rating: 4.88,
      tripsDone: 1240,
      photo: 'assets/driver_1.png',
      assignedAt: 'Today, 06:15 PM'
    },
    pickupNotes: 'Near 2nd Avenue Roundtana'
  },
  {
    id: 'PKM-91420',
    serviceType: 'intercity',
    tripType: 'round',
    status: 'Confirmed',
    statusBadge: 'Upcoming',
    driverAssigned: false,
    driver: null,
    pickup: 'Koramangala, Bengaluru, Karnataka',
    drop: 'Mysuru Palace, Mysuru, Karnataka',
    pickupTime: '15 Oct 2026, 06:00 AM',
    departureDate: '2026-10-15',
    vehicleCategory: 'Innova Crysta Luxury',
    vehicleModel: 'Toyota Innova Crysta Executive',
    passengerName: 'Karthik Prabhu',
    passengerPhone: '+91 98401 23456',
    passengerEmail: 'karthik@example.com',
    distanceKm: 310,
    fare: {
      base: 7200,
      tolls: 360,
      driverAllowance: 500,
      tax: 385,
      discount: 300,
      total: 8145,
      advancePaid: 8145,
      balanceDue: 0
    },
    paymentMethod: 'UPI (GPay / PhonePe)',
    reservationOtp: '4921',
    otpReleased: true,
    pickupNotes: 'Gate 4 near Sony World signal'
  },
  {
    id: 'PKM-74910',
    serviceType: 'incity',
    tripType: 'oneway',
    status: 'In Progress',
    statusBadge: 'Ongoing',
    pickup: 'Koramangala 4th Block, Bengaluru, Karnataka',
    drop: 'Kempegowda International Airport (BLR), Bengaluru, Karnataka',
    pickupTime: 'Today, 09:30 PM',
    vehicleCategory: 'Prime SUV',
    vehicleModel: 'Maruti Ertiga (Silver)',
    vehicleReg: 'KA 05 MN 9012',
    passengerName: 'Karthik Prabhu',
    passengerPhone: '+91 98401 23456',
    passengerEmail: 'karthik@example.com',
    distanceKm: 42,
    fare: {
      base: 1150,
      tolls: 110,
      tax: 63,
      discount: 0,
      total: 1323,
      advancePaid: 1323,
      balanceDue: 0
    },
    paymentMethod: 'Credit Card (HDFC **** 4091)',
    reservationOtp: '7193',
    otpReleased: true,
    driver: {
      name: 'Suresh Gowda',
      phone: '+91 99014 ••••• (Click to call)',
      fullPhone: '+91 99014 31289',
      rating: 4.92,
      tripsDone: 890,
      photo: 'assets/driver_2.png',
      assignedAt: 'Today, 08:45 PM'
    },
    pickupNotes: 'Gate 2 main entrance'
  },
  {
    id: 'PKM-61043',
    serviceType: 'airport',
    tripType: 'drop',
    status: 'Completed',
    statusBadge: 'Completed',
    pickup: 'T. Nagar, Chennai, Tamil Nadu',
    drop: 'Chennai International Airport (MAA), Chennai, Tamil Nadu',
    pickupTime: '05 Oct 2026, 02:30 PM',
    completedAt: '05 Oct 2026, 03:22 PM',
    vehicleCategory: 'Prime Sedan',
    vehicleModel: 'Hyundai Aura (White)',
    vehicleReg: 'TN 07 CK 3901',
    passengerName: 'Karthik Prabhu',
    passengerPhone: '+91 98401 23456',
    passengerEmail: 'karthik@example.com',
    distanceKm: 14,
    fare: {
      base: 720,
      tolls: 0,
      tax: 36,
      discount: 100,
      total: 656,
      advancePaid: 656,
      balanceDue: 0
    },
    paymentMethod: 'UPI',
    reservationOtp: '3318',
    driver: {
      name: 'Ramesh Kumar',
      phone: '+91 97102 •••••',
      fullPhone: '+91 97102 44102',
      rating: 4.85,
      tripsDone: 2150,
      photo: 'assets/driver_3.png'
    },
    invoiceNumber: 'INV-2026-10-8291'
  },
  {
    id: 'PKM-52190',
    serviceType: 'rental',
    tripType: 'rental',
    packageHours: 4,
    packageKm: 40,
    status: 'Cancelled',
    statusBadge: 'Cancelled',
    pickup: 'Indiranagar 100ft Road, Bengaluru, Karnataka',
    drop: 'Multiple City Stops (Rental 4h / 40km)',
    pickupTime: '28 Sep 2026, 10:00 AM',
    cancelledAt: '28 Sep 2026, 07:45 AM',
    cancellationReason: 'Travel plan rescheduled by passenger',
    vehicleCategory: 'Hatchback',
    vehicleModel: 'Maruti WagonR',
    passengerName: 'Karthik Prabhu',
    passengerPhone: '+91 98401 23456',
    passengerEmail: 'karthik@example.com',
    fare: {
      base: 950,
      tax: 48,
      discount: 0,
      total: 998,
      advancePaid: 998,
      balanceDue: 0
    },
    refundStatus: 'Completed',
    refundAmount: 998,
    refundRef: 'REF-TXN-902194'
  }
];
