async function test() {
    try {
        const response = await fetch('http://localhost:5000/api/fengshui/consult', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ birthDate: '1995-01-01' })
        });
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

test();
