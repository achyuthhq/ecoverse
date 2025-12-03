import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Improved validation for AI responses
function isValidAIResponse(text: string): boolean {
  // Check for minimum length (a good response should be substantial)
  if (text.length < 500) {
    console.log("Response too short:", text.length);
    return false;
  }
  
  // Check for proper markdown formatting
  if (!text.includes('#')) {
    console.log("No markdown headings found");
    return false;
  }
  
  // Check for the title
  if (!text.includes('Analysis:') && !text.includes('ANALYSIS:')) {
    console.log("No analysis title found");
    return false;
  }
  
  // Check for multiple sections (should have at least 5)
  const headingMatches = text.match(/#{2,3}\s+/g);
  if (!headingMatches || headingMatches.length < 5) {
    console.log("Not enough sections found:", headingMatches?.length || 0);
    return false;
  }
  
  // Check for bullet points (should have several)
  const bulletPoints = text.match(/[•\-\*]\s+/g);
  if (!bulletPoints || bulletPoints.length < 10) {
    console.log("Not enough bullet points found:", bulletPoints?.length || 0);
    return false;
  }
  
  // Check for error indicators
  if (
    text.includes('[object Object]') ||
    text.includes('undefined') ||
    text.includes('<!DOCTYPE html>') ||
    text.includes('Error:') ||
    text.includes('error occurred') ||
    text.includes('not available')
  ) {
    console.log("Error indicators found in response");
    return false;
  }
  
  return true;
}

// Simpler validation for biodegradability checks
function isValidBiodegradabilityResponse(text: string): boolean {
  return text.length > 10 && 
         !text.includes('[object Object]') &&
         !text.includes('undefined') &&
         !text.includes('<!DOCTYPE html>') &&
         !text.includes('Error:');
}

// Enhanced retry logic with validation - for full environmental analysis
async function fetchWithEnhancedRetry(prompt: string, isInitialAnalysis: boolean = false, retries = 2): Promise<string> {
  try {
    // Use the new enter.pollinations.ai API
    const apiKey = process.env.POLLINATIONS_API_KEY || '';
    const encodedPrompt = encodeURIComponent(prompt);
    const apiUrl = `https://enter.pollinations.ai/api/generate/text/${encodedPrompt}${apiKey ? `?key=${apiKey}` : ''}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const responseText = await response.text();

    // Validate response based on the type of request
    const isValid = isInitialAnalysis 
      ? isValidAIResponse(responseText) 
      : isValidBiodegradabilityResponse(responseText);

    if (!isValid) {
      if (retries > 0) {
        console.log(`Invalid response format, retrying... (${retries} attempts left)`);
        return fetchWithEnhancedRetry(prompt, isInitialAnalysis, retries - 1);
      }
      throw new Error('Invalid AI response format after retries');
    }

    return responseText;
  } catch (error) {
    if (retries > 0) {
      console.log(`API call failed, retrying... (${retries} attempts left)`);
      // Add exponential backoff
      await new Promise(resolve => setTimeout(resolve, (3 - retries) * 1000));
      return fetchWithEnhancedRetry(prompt, isInitialAnalysis, retries - 1);
    }
    throw error;
  }
}

// Update getAIResponse to accept isInitialAnalysis parameter
async function getAIResponse(prompt: string, isInitialAnalysis: boolean = false): Promise<string> {
  return fetchWithEnhancedRetry(prompt, isInitialAnalysis);
}

// Update the biodegradability check function to return a concise 3-4 word response
async function checkDegradability(item: string, materialType: string = "unknown material"): Promise<string> {
  try {
    const prompt = `Analyze if ${item} made of ${materialType} is biodegradable. 
Give ONLY a very concise 3-4 word response about its biodegradability status.
Examples: 
- "Not biodegradable, 450+ years"
- "Biodegradable, 2-6 weeks"
- "Partially biodegradable, 5-10 years"
- "Non-biodegradable plastic waste"
- "Compostable under industrial conditions"

DO NOT include any explanations, just the 3-4 word response.`;
    
    // Use simpler validation for biodegradability checks
    const response = await getAIResponse(prompt, false);
    
    const cleanResponse = response.trim()
      .replace(/^[^A-Za-z]+/, '') // Remove leading special chars
      .replace(/[^A-Za-z0-9\s.,()-]+$/, '') // Remove trailing special chars
      .replace(/^(is|not)\s+/i, '') // Remove leading "is" or "not"
      .replace(/^it\s+is\s+/i, '') // Remove leading "it is"
      .replace(/\.$/, ''); // Remove trailing period
    
    // Ensure the response is concise (3-8 words)
    const wordCount = cleanResponse.split(/\s+/).length;
    if (wordCount > 8) {
      // If too long, extract just the first part
      return cleanResponse.split(/[,.;]/).slice(0, 1).join('').trim();
    }
    
    return cleanResponse;
  } catch (error) {
    console.error('Degradability check error:', error);
    // Provide a fallback response that doesn't rely on the API
    return `Depends on specific materials`;
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { analysisId, message } = await req.json();

    if (!analysisId) {
      return NextResponse.json({ error: "Analysis ID is required" }, { status: 400 });
    }

    // Get analysis from database
    const analysis = await prisma.analysis.findUnique({
      where: { id: analysisId },
    });

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }
    
    // Check if user has access to this analysis
    if (analysis.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    // Handle biodegradability status
    let biodegradabilityStatus = "";
    
    // Always perform biodegradability check for initial analysis
    if (!message || message === "initial") {
      try {
        // Try to get biodegradability from API
        biodegradabilityStatus = await checkDegradability(
          analysis.label, 
          analysis.type || "unknown material"
        );
        
        // Store the result in the database for future use
        await prisma.analysis.update({
          where: { id: analysisId },
          data: { degradability: biodegradabilityStatus }
        });
      } catch (error) {
        console.error("Error checking biodegradability:", error);
        
        // Use fallback if API fails
        biodegradabilityStatus = analysis.degradability && analysis.degradability !== "Unknown - Needs assessment" 
          ? analysis.degradability 
          : `Depends on specific materials`;
      }
      
      // If still empty, use a default
      if (!biodegradabilityStatus) {
        biodegradabilityStatus = analysis.degradability && analysis.degradability !== "Unknown - Needs assessment"
          ? analysis.degradability
          : `Pending assessment`;
      }
    }

    // Get AI response based on message type
    let aiResponse;
    try {
      // For initial messages, make sure to get a proper AI response
      if (!message || message === "initial") {
        // Create a more detailed prompt for initial analysis
        const detailedPrompt = prepareInitialPrompt(analysis, biodegradabilityStatus);
        
        // Make multiple attempts to get a good AI response
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            console.log(`Attempting to get AI response (attempt ${attempt + 1})`);
            aiResponse = await getAIResponse(detailedPrompt, true);
            
            // Validate that we got a proper response
            if (aiResponse && aiResponse.length > 500 && aiResponse.includes('#')) {
              console.log("Got valid AI response");
              break;
            } else {
              console.log("Invalid AI response, retrying...");
            }
          } catch (innerError) {
            console.error(`Error in attempt ${attempt + 1}:`, innerError);
            // Continue to next attempt
          }
        }
        
        // If we still don't have a valid response, throw an error to trigger fallback
        if (!aiResponse || aiResponse.length < 500 || !aiResponse.includes('#')) {
          throw new Error("Failed to get valid AI response after multiple attempts");
        }
        
        // Format the response
        aiResponse = formatInitialResponse(aiResponse, analysis);
      } else {
        // For follow-up messages, use the standard approach
        const prompt = prepareFollowUpPrompt(analysis, message);
        aiResponse = await getAIResponse(prompt, false);
        aiResponse = formatFollowUpResponse(aiResponse);
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Provide fallback response
      if (!message || message === "initial") {
        console.log("Using fallback analysis template");
        aiResponse = generateFallbackAnalysis(analysis, biodegradabilityStatus);
      } else {
        aiResponse = `I'm sorry, I couldn't generate a specific response about ${analysis.label} for your question. 

## 💚 General Information

Based on our database, this item is categorized as ${analysis.category || "mixed waste"} and made of ${analysis.type || "mixed materials"}. 

${biodegradabilityStatus}

Please try asking a different question, or check our general recycling guidelines for more information.`;
      }
    }

    // Return the formatted response
    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

// Update the formatInitialResponse function to use "Ecoverse Analysis" in the title
function formatInitialResponse(response: string, analysis: any): string {
  // If the response doesn't have proper markdown formatting, add it
  if (!response.includes('#')) {
    return `# Ecoverse Analysis: ${analysis.label}\n\n${response}`;
  }
  
  // Ensure the response has the item name in the title
  if (!response.toLowerCase().includes(analysis.label.toLowerCase())) {
    response = response.replace(/# .*?Environmental Analysis.*?$/mi, `# Ecoverse Analysis: ${analysis.label}`);
  } else {
    // Replace any emoji in the title with "Ecoverse Analysis"
    response = response.replace(/# .*?(?:Environmental|Eco|🌿|♻️).*?Analysis.*?: (.*?)$/mi, `# Ecoverse Analysis: $1`);
  }
  
  // Improve spacing for better readability
  response = response
    // Ensure exactly TWO blank lines before each section heading
    .replace(/\n+(#{1,3} )/g, '\n\n\n$1')
    
    // Add TWO blank lines after headings
    .replace(/^(#+ .+)$/gm, '$1\n\n')
    
    // Add space after bullet points
    .replace(/^([•-] .+)$/gm, '$1\n\n')
    
    // Ensure sub-points are indented and have proper spacing
    .replace(/^([•-] .+\n)((?:[•-] .+\n)+)/gm, (_, main, subs) => 
      main + '\n' + subs.split('\n').map((line: string) => '  ' + line + '\n').join(''))
    
    // Add space after numbered lists
    .replace(/^(\d+\. .+)$/gm, '$1\n\n')
    
    // Ensure proper spacing around horizontal rules
    .replace(/\n---\n/g, '\n\n\n---\n\n\n')
    
    // Add space after emojis in headings
    .replace(/(#+ )(🌿|💚|♻️|📊|🗑️|⏳|☢️|🌍|⚕️|🔄|🌱|📝|💡|📍|🎯)(\s*)/g, '$1$2 ')
    
    // Add spacing between bullet points in the same section
    .replace(/^([•-] .+\n)(?=[•-])/gm, '$1\n')
    
    // Remove any excessive blank lines (more than 4)
    .replace(/\n{5,}/g, '\n\n\n\n');
  
  // Add a final call-to-action with proper spacing
  if (!response.includes('Ask me specific questions')) {
    response += '\n\n\n---\n\n\n*Ask me specific questions about this analysis or how to better handle this item!* 💬\n';
  }
  
  return response;
}

// Update the prepareInitialPrompt function to create more detailed and high-quality prompts
function prepareInitialPrompt(analysis: any, biodegradabilityStatus: string): string {
  // Parse JSON fields
  const harms = parseJsonField(analysis.harms);
  const disposal = parseJsonField(analysis.disposal);
  const alternatives = parseJsonField(analysis.alternatives);
  const environmentalImpact = parseJsonField(analysis.environmentalImpact);
  
  return `You are an expert environmental scientist and sustainability specialist. Create a comprehensive, detailed, and informative environmental analysis report for a ${analysis.label} made of ${analysis.type || "mixed materials"} categorized as ${analysis.category || "mixed waste"}.

Your analysis should be scientifically accurate, educational, and actionable. Include specific data, statistics, and facts wherever possible. Make your analysis detailed and thorough, covering all environmental aspects of this item.

IMPORTANT: This is the FIRST message in the conversation, so make it comprehensive and informative. The user has uploaded an image of this item for analysis, and your response will set the tone for the entire interaction.

Use these details from our database:
- Item: ${analysis.label}
- Material: ${analysis.type || "Unknown/Mixed materials"}
- Category: ${analysis.category || "Unknown/Mixed waste"}
- Biodegradability: ${biodegradabilityStatus}
- Environmental Impact: ${environmentalImpact.length > 0 ? environmentalImpact.join(", ") : "Data not available"}
- Disposal Methods: ${disposal.length > 0 ? disposal.join(", ") : "Data not available"}
- Eco-friendly Alternatives: ${alternatives.length > 0 ? alternatives.join(", ") : "Data not available"}
- Potential Harms: ${harms.length > 0 ? harms.join(", ") : "Data not available"}
- Reuse Potential: ${analysis.potentialForReuse || "Data not available"}

Follow these STRICT formatting rules:
1. Use proper Markdown with clear section spacing
2. CRITICAL: Add THREE blank lines between sections for better readability
3. Add TWO blank lines after each heading
4. Add TWO blank lines between bullet points - NEVER put multiple bullet points on the same line
5. Use detailed bullet points with sub-points where relevant
6. Include specific numbers, percentages, and data points
7. Make each section comprehensive with at least 4-5 detailed points
8. Use emojis strategically for visual appeal
9. Bold key terms and important numbers
10. IMPORTANT: Format each bullet point on its own line with space after

Structure your response exactly as follows:

# Ecoverse Analysis: ${analysis.label}



## 📊 Material Composition


• Provide detailed breakdown of materials with percentages


• Include information about production processes


• Discuss additives, coatings, and chemical treatments


• Explain how material properties affect environmental impact


• Reference industry standards and material classifications

${analysis.type ? `\n\n• Primary material: ${analysis.type} (include detailed information about this specific material)\n\n` : ''}


## 🗑️ Waste Category


• Specify primary and secondary waste categories with explanations


• Detail regulatory classifications in different regions


• Explain why it falls into these categories based on composition


• Discuss how categorization affects disposal requirements


• Mention any special handling categories that may apply

${analysis.category ? `\n\n• Current classification: ${analysis.category} (explain implications of this classification)\n\n` : ''}


## ⏳ Biodegradability Status


**${biodegradabilityStatus}**


• Provide detailed timeframes for decomposition under different conditions


• Explain factors affecting decomposition rate (temperature, moisture, microbial activity)


• Compare biodegradability to similar items


• Discuss any non-biodegradable components and their persistence


• Explain the difference between biodegradable, compostable, and degradable



## ☢️ Toxicity Level


• Rate toxicity on a scale of 1-5 with scientific justification


• List specific toxic components and their concentration ranges


• Detail conditions that may release toxins (heat, UV exposure, mechanical stress)


• Explain potential bioaccumulation in ecosystems


• Discuss regulatory standards for these toxins in different countries



## 🌍 Environmental Impacts


${environmentalImpact.length > 0 || harms.length > 0 ? '• ' + [...environmentalImpact, ...harms].join('\n\n\n• ') + '\n\n' : ''}

• Calculate carbon footprint throughout lifecycle (production, use, disposal)


• Quantify water usage and pollution impacts


• Detail energy consumption in manufacturing


• Explain ecosystem disruption potential


• Discuss microplastic or particulate release concerns if applicable



## ⚕️ Health Risks


• List both direct and indirect health risks with scientific evidence


• Include exposure pathways and threshold levels


• Detail vulnerable populations (children, pregnant women, etc.)


• Provide safety precautions based on latest research


• Discuss long-term vs. short-term health concerns



## ♻️ Reuse Potential


${analysis.potentialForReuse ? `• ${analysis.potentialForReuse}\n\n` : ''}

• List 5-7 creative reuse ideas with specific instructions


• Include DIY project possibilities with difficulty ratings


• Estimate reuse lifespan for different applications


• Discuss economic benefits of reuse vs. disposal


• Provide examples of successful reuse programs



## 🔄 Real-world Reuse Examples


• Provide 3-4 detailed case studies of successful reuse initiatives


• Include statistics on waste reduction from these examples


• Highlight innovative approaches from different countries


• Discuss scalability of these solutions


• Mention organizations leading in this space



## 🌱 Eco-friendly Alternatives


${alternatives.length > 0 ? '• ' + alternatives.join('\n\n\n• ') + '\n\n' : ''}

• Compare environmental footprint of each alternative


• Rate sustainability of each option on multiple criteria


• Provide cost comparison between conventional and eco-friendly options


• List availability and sources with specific brands or products


• Discuss emerging innovations in this space



## 📝 Proper Disposal Method


${disposal.length > 0 ? '• ' + disposal.join('\n\n\n• ') + '\n\n' : ''}

• Detail step-by-step process for optimal disposal


• List special handling requirements with scientific rationale


• Include safety precautions for hazardous components


• Explain what happens after disposal in different systems


• Discuss regional variations in disposal infrastructure



## 💡 Recycling Tips


• Provide specific preparation steps (cleaning, disassembly, sorting)


• List common mistakes to avoid with explanations


• Include regional variations in recycling acceptance


• Explain recycling symbols and codes relevant to this item


• Discuss contamination issues and how to prevent them



## 🎯 Fun Facts & Impact Stats


• Include 3-5 surprising facts about this item's environmental impact


• Share relevant statistics with sources


• Add historical context about how this item has evolved


• Mention future implications and trends


• Include comparative data with similar products



## 📍 Finding Recycling Centers


• Provide guidance on finding local facilities


• List common acceptance criteria for this specific item


• Suggest questions to ask recycling centers


• Mention digital tools and apps for locating recycling options


• Discuss mail-in recycling programs if applicable



## 📊 Carbon Footprint Rating


• Provide detailed rating (1-5) with scientific justification


• Break down contributing factors across lifecycle stages


• Compare to alternatives with percentage differences


• List specific reduction strategies for consumers


• Discuss industry initiatives to reduce carbon impact



## 🎯 Action Plan


1. Immediate steps consumers can take (be specific)


2. Short-term goals for reducing environmental impact


3. Long-term strategies for systemic change


4. Community involvement opportunities


5. Measuring personal impact with specific metrics



## 💚 Awareness Message


• Include impactful statistics that motivate action


• Add specific, actionable call to action


• Provide hope for positive change with evidence


• Link to global sustainability goals (SDGs)


• Emphasize individual impact potential with examples


NOTE FOR AI ONLY: This is the FIRST message in the conversation, so make it comprehensive, detailed, and informative. Use specific data and facts rather than generalities. Ensure TRIPLE spacing between all sections and DOUBLE spacing between bullet points. Never combine multiple bullet points on the same line. Make this analysis substantially better than a template response - it should be personalized to this specific item with scientific accuracy.`;
}

// Update the prepareFollowUpPrompt function to emphasize better spacing
function prepareFollowUpPrompt(analysis: any, userMessage: string): string {
  // Parse JSON fields
  const harms = parseJsonField(analysis.harms);
  const disposal = parseJsonField(analysis.disposal);
  const alternatives = parseJsonField(analysis.alternatives);
  const environmentalImpact = parseJsonField(analysis.environmentalImpact);
  
  return `You are an environmental analysis assistant providing information about a ${analysis.label} made of ${analysis.type || "mixed materials"} categorized as ${analysis.category || "mixed waste"}. 

The user is asking: "${userMessage}"

Based on the following information about the item, provide a detailed, helpful response:

ITEM DETAILS:
- Name: ${analysis.label}
- Material: ${analysis.type || "Unknown"}
- Category: ${analysis.category || "Unknown"}
- Biodegradability: ${analysis.degradability || "Pending assessment"}
- Toxicity: ${analysis.toxicity || "Unknown"}
- Environmental Impact: ${environmentalImpact.join(", ") || "Unknown"}
- Disposal Methods: ${disposal.join(", ") || "Unknown"}
- Eco-friendly Alternatives: ${alternatives.join(", ") || "Unknown"}
- Harms: ${harms.join(", ") || "Unknown"}
- Reuse Potential: ${analysis.potentialForReuse || "Unknown"}

Follow these STRICT formatting rules:
1. Use proper Markdown with clear section headings
2. CRITICAL: Add THREE blank lines between sections for better readability
3. Add TWO blank lines after each heading
4. Add TWO blank lines between bullet points - NEVER put multiple bullet points on the same line
5. Use emojis strategically for visual appeal (🌿, ♻️, 💚, etc.)
6. Bold important terms and statistics
7. Use bullet points for lists, with each point on its own line
8. Include relevant section headings based on the user's question
9. Keep your response concise but comprehensive
10. Format each bullet point on its own line with space after

If the user asks about something not covered in the provided information:
1. Use your knowledge about similar materials and environmental principles


2. Clearly indicate when you're providing general information vs. specific data


3. Suggest resources for further information when appropriate

End your response with a question or suggestion to encourage further engagement.

NOTE FOR AI ONLY: CRITICAL - Ensure TRIPLE spacing between all sections and DOUBLE spacing between bullet points. Never combine multiple bullet points on the same line.`;
}

// Update the formatFollowUpResponse function to ensure better spacing
function formatFollowUpResponse(response: string): string {
  // Improve spacing for better readability
  response = response
    // Ensure exactly TWO blank lines before each section heading
    .replace(/\n+(#{1,3} )/g, '\n\n\n$1')
    
    // Add TWO blank lines after headings
    .replace(/^(#+ .+)$/gm, '$1\n\n')
    
    // Add space after bullet points
    .replace(/^([•-] .+)$/gm, '$1\n\n')
    
    // Ensure sub-points are indented and have proper spacing
    .replace(/^([•-] .+\n)((?:[•-] .+\n)+)/gm, (_, main, subs) => 
      main + '\n' + subs.split('\n').map((line: string) => '  ' + line + '\n').join(''))
    
    // Add space after numbered lists
    .replace(/^(\d+\. .+)$/gm, '$1\n\n')
    
    // Ensure proper spacing around horizontal rules
    .replace(/\n---\n/g, '\n\n\n---\n\n\n')
    
    // Add space after emojis in headings
    .replace(/(#+ )(🌿|💚|♻️|📊|🗑️|⏳|☢️|🌍|⚕️|🔄|🌱|📝|💡|📍|🎯)(\s*)/g, '$1$2 ')
    
    // Add spacing between bullet points in the same section
    .replace(/^([•-] .+\n)(?=[•-])/gm, '$1\n')
    
    // Remove any excessive blank lines (more than 4)
    .replace(/\n{5,}/g, '\n\n\n\n');
  
  // Add a final call-to-action if not present
  if (!response.toLowerCase().includes('anything else') && !response.includes('Ask me')) {
    response += '\n\n\n---\n\n\n*Is there anything else you would like to know about this item?* 💬\n';
  }
  
  return response;
}

// Helper function to parse JSON fields
function parseJsonField(field: string | null): any[] {
  if (!field) return [];
  
  try {
    const parsed = JSON.parse(field);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (e) {
    return [];
  }
}

// Generate a fallback analysis when the API fails
function generateFallbackAnalysis(analysis: any, biodegradabilityStatus: string): string {
  // Parse JSON fields
  const harms = parseJsonField(analysis.harms);
  const disposal = parseJsonField(analysis.disposal);
  const alternatives = parseJsonField(analysis.alternatives);
  const environmentalImpact = parseJsonField(analysis.environmentalImpact);
  
  return `# Ecoverse Analysis: ${analysis.label}


## 📊 Material Composition

• Primary material: ${analysis.type || "Mixed materials"}


• Composition varies based on manufacturer and production methods


• May contain additives for durability and functionality



## 🗑️ Waste Category

• Current classification: ${analysis.category || "Mixed waste"}


• Should be sorted according to local recycling guidelines


• Check with local waste management for specific handling instructions



## ⏳ Biodegradability Status

**${biodegradabilityStatus}**


• Environmental conditions affect decomposition rate


• Temperature, moisture, and microbial activity influence breakdown



## ☢️ Toxicity Level

• Toxicity depends on specific materials and manufacturing processes


• Potential for leaching chemicals under certain conditions


• Follow proper disposal methods to minimize environmental impact



## 🌍 Environmental Impacts

${environmentalImpact.length > 0 || harms.length > 0 ? '• ' + [...environmentalImpact, ...harms].join('\n\n• ') : '• May contribute to waste accumulation if improperly disposed\n\n• Production process requires energy and resources'}


• Improper disposal can harm wildlife and ecosystems



## ♻️ Reuse Potential

${analysis.potentialForReuse ? `• ${analysis.potentialForReuse}` : '• Consider creative reuse before disposal'}


• Extending product life reduces environmental impact


• Many items can be repurposed for different uses



## 🌱 Eco-friendly Alternatives

${alternatives.length > 0 ? '• ' + alternatives.join('\n\n• ') : '• Look for sustainable alternatives made from renewable materials\n\n• Consider products with less environmental impact'}


• Research brands committed to sustainable practices



## 📝 Proper Disposal Method

${disposal.length > 0 ? '• ' + disposal.join('\n\n• ') : '• Follow local guidelines for proper disposal\n\n• Consider recycling if materials are accepted locally'}


• Contact local recycling centers for specific instructions



## 💡 Recycling Tips

• Clean items before recycling when applicable


• Remove non-recyclable components


• Check local recycling guidelines for specific instructions



## 💚 Awareness Message

• Making informed choices about consumption and disposal helps protect our environment


• Small changes in daily habits can lead to significant positive environmental impact



---



*Ask me specific questions about this analysis or how to better handle this item!* 💬
`;
}