const API_URL = "http://localhost:3000/api/debates";

async function testBackend() {
  const testId = "test-" + Date.now();
  
  console.log("1. Creating a debate...");
  const createRes = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: testId,
      topic: { title: "AI is good", category: "Tech" },
      debater1: { id: "user1", username: "Alice" },
      position: "for"
    })
  });
  
  if (createRes.status === 201) {
    console.log("✅ Debate Created:", testId);
  } else {
    console.error("❌ Create Failed:", await createRes.text());
    return;
  }

  console.log("2. Joining the debate...");
  const joinRes = await fetch(`${API_URL}/${testId}/join`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      debater2: { id: "user2", username: "Bob" }
    })
  });

  if (joinRes.status === 200) {
    console.log("✅ User Joined successfully");
    const data = await joinRes.json();
    console.log("   Status is now:", data.status); // Should be 'active'
  } else {
    console.error("❌ Join Failed:", await joinRes.text());
  }
}

testBackend();