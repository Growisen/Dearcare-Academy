// Test for Corporate Enquiry API
// This is a simple test to verify the API works correctly

const testCorporateEnquiryAPI = async () => {
  const testData = {
    organization_type: "Hospital",
    organization_name: "Test Medical Center",
    contact_person: "John Doe",
    designation: "HR Manager",
    email: "john.doe@testmedical.com",
    phone_no: "9876543210",
    staff_count: 5,
    message: "We need experienced healthcare professionals for our new ICU unit."
  };

  try {
    // Test POST request
    const response = await fetch('http://localhost:3000/api/corporate-enquiry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('POST Response:', result);

    if (response.ok) {
      console.log('✅ Corporate enquiry submitted successfully!');
      
      // Test GET request
      const getResponse = await fetch('http://localhost:3000/api/corporate-enquiry');
      const getResult = await getResponse.json();
      console.log('GET Response:', getResult);
      
      if (getResponse.ok) {
        console.log('✅ Corporate enquiries fetched successfully!');
        console.log(`Found ${getResult.data.length} corporate enquiries`);
      } else {
        console.error('❌ Failed to fetch corporate enquiries');
      }
    } else {
      console.error('❌ Failed to submit corporate enquiry:', result.error);
    }
  } catch (error) {
    console.error('❌ API Test Error:', error);
  }
};

// Run the test
// testCorporateEnquiryAPI();

console.log('Corporate Enquiry API Test Ready');
console.log('To run the test, call: testCorporateEnquiryAPI()');

export { testCorporateEnquiryAPI };
