export async function POST(req: Request) {
  const { messages, selectedService, serviceDetails } = await req.json()

  // Simple mock response for demonstration
  const mockResponse = {
    content:
      "Thank you for your message! This is a demonstration of the chat system. In a production environment, this would be connected to a real AI service.",
  }

  return new Response(JSON.stringify(mockResponse), {
    headers: { "Content-Type": "application/json" },
  })
}
