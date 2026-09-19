import { GoogleGenAI } from "@google/genai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import fs from "fs";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

let cloudinaryClientPromise;

const getCloudinary = async () => {
  if (!cloudinaryClientPromise) {
    cloudinaryClientPromise = import("cloudinary").then(({ v2 }) => {
      v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      return v2;
    });
  }

  return cloudinaryClientPromise;
};

export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, topic, length, tone, audience, keywords } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    const topicText = topic || prompt || "Technology and Innovation";
    const toneText = tone || "Professional & Engaging";
    const audienceText = audience ? `Target Audience: ${audience}.` : "";
    const keywordsText = keywords ? `Focus Keywords: ${keywords}.` : "";

    const systemPrompt = `Write a comprehensive, well-structured, high-quality article about "${topicText}".
Tone: ${toneText}.
${audienceText}
${keywordsText}

Format with clean Markdown:
- An engaging H1 Title
- A compelling introduction that hooks the reader
- Organized body sections with informative H2 & H3 subheadings
- Bullet points and bold text where appropriate for high readability
- Actionable takeaways, tips, or real-world examples
- A strong, thoughtful conclusion`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: length ? Math.min(Math.max(Number(length), 800), 4000) : 2000,
      },
    });

    const content =
      response.text ||
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "";

    await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${topicText}, ${content}, 'article') `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error("Generate article error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, keyword, category, tone } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    const topicKeyword = keyword || prompt || "AI Innovation";
    const cat = category || "General";
    const toneVal = tone || "High CTR & Engaging";

    const systemPrompt = `You are an elite viral content strategist and copywriter.
Generate 10 magnetic, high-converting blog titles for the topic/keyword "${topicKeyword}" in the "${cat}" category.
Tone: ${toneVal}.

Respond ONLY with a valid JSON object matching this schema:
{
  "titles": [
    {
      "title": string,
      "type": "Listicle" | "How-To" | "Curiosity" | "Guide" | "Thought Leadership",
      "score": number (integer between 75 and 99 representing CTR potential),
      "characterCount": number,
      "whyItWorks": string (1 punchy sentence explaining why this title drives clicks)
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const rawContent =
      response.text ||
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "{}";

    let parsedData = null;
    try {
      parsedData = JSON.parse(rawContent);
    } catch {
      const cleaned = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedData = JSON.parse(cleaned);
    }

    const content = JSON.stringify(parsedData);

    await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${topicKeyword}, ${content}, 'blog-title') `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content, data: parsedData });
  } catch (error) {
    console.error("Generate blog title error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateImage = async (req, res) => {
  try {
    const cloudinary = await getCloudinary();
    const { userId } = req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    const formData = new FormData();
    formData.append("prompt", prompt);
    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: { "x-api-key": process.env.CLIPDROP_API_KEY },
        responseType: "arraybuffer",
      }
    );

    const base64Image = `data:image/png;base64,${Buffer.from(
      data,
      "binary"
    ).toString("base64")}`;

    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    await sql` INSERT INTO creations (user_id, prompt, content, type, publish) VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false
      }) `;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const removeImageBackground = async (req, res) => {
  try {
    const cloudinary = await getCloudinary();
    const { userId } = req.auth();
    const image = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          effect: "background_removal",
          background_removal: "remove_the_background",
        },
      ],
    });

    await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image') `;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const removeImageObject = async (req, res) => {
  try {
    const cloudinary = await getCloudinary();
    const { userId } = req.auth();
    const { object } = req.body;
    const image = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    const { public_id } = await cloudinary.uploader.upload(image.path);

    const imageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
      resource_type: "image",
    });

    await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image') `;

    res.json({ success: true, content: imageUrl });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
export const resumeReview = async (req, res) => {
  const resume = req.file;
  try {
    const { userId } = req.auth();
    const plan = req.plan;

    // Check premium plan
    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    // Check file uploaded
    if (!resume) {
      return res.json({
        success: false,
        message: "No resume uploaded",
      });
    }

    // Check file size (5MB)
    if (resume.size > 5 * 1024 * 1024) {
      return res.json({
        success: false,
        message: "Resume file size exceeds allowed size (5MB).",
      });
    }

    // Read PDF file
    const dataBuffer = fs.readFileSync(resume.path);

    // Extract text from PDF (handles both pdf-parse v2 and v1)
    let extractedText = "";
    const pdfModule = await import("pdf-parse");

    if (pdfModule.PDFParse) {
      const parser = new pdfModule.PDFParse({ data: dataBuffer });
      const pdfData = await parser.getText();
      extractedText = pdfData?.text || "";
      await parser.destroy();
    } else if (typeof pdfModule.default === "function") {
      const pdfData = await pdfModule.default(dataBuffer);
      extractedText = pdfData?.text || "";
    } else if (typeof pdfModule === "function") {
      const pdfData = await pdfModule(dataBuffer);
      extractedText = pdfData?.text || "";
    } else {
      throw new Error("Unable to load PDF parser module");
    }

    if (!extractedText || !extractedText.trim()) {
      return res.json({
        success: false,
        message: "Could not extract readable text from the uploaded PDF. Please ensure the PDF is not scanned or empty.",
      });
    }

    // AI prompt for comprehensive ATS scoring and feedback
    const prompt = `You are an elite Applicant Tracking System (ATS) auditor and executive resume reviewer.
Analyze the following resume thoroughly and provide an in-depth, realistic ATS audit and scoring report.

Resume Content:
${extractedText}

Respond ONLY with a valid JSON object strictly matching this schema:
{
  "overallScore": number (integer between 0 and 100 representing overall ATS readiness),
  "atsParseRate": number (integer between 0 and 100, e.g. 86),
  "atsMissedRate": number (100 minus atsParseRate, e.g. 14),
  "summary": string (2-3 concise sentences summarizing resume readiness and primary opportunity for improvement),
  "categories": [
    {
      "id": "content",
      "name": "CONTENT",
      "score": number (integer 0-100),
      "issueCount": number (count of items with status !== 'pass'),
      "items": [
        {
          "id": "ats-parse-rate",
          "name": "ATS Parse Rate",
          "status": "pass" | "issue" | "warning",
          "score": number (0-100),
          "readRate": number (percentage read, e.g. 86),
          "missedRate": number (percentage missed, e.g. 14),
          "description": "Employers and recruiters use an Applicant Tracking System (ATS) to scan job applications at scale. A high parse rate means the ATS reads your experience and skills clearly, so more recruiters see your resume.",
          "callout": string (e.g. "The missing 14% of your resume isn't your experience — it's your template."),
          "findings": string (specific findings based on the uploaded resume text),
          "recommendation": string (concrete fix for the candidate)
        },
        {
          "id": "quantifying-impact",
          "name": "Quantifying Impact",
          "status": "pass" | "issue" | "warning",
          "score": number (0-100),
          "description": "Recruiters look for numbers (%, $, metrics) that prove your accomplishments and measurable business results.",
          "findings": string,
          "recommendation": string
        },
        {
          "id": "repetition",
          "name": "Repetition",
          "status": "pass" | "issue" | "warning",
          "score": number (0-100),
          "description": "Using varied action verbs and eliminating filler words keeps hiring managers engaged.",
          "findings": string,
          "recommendation": string
        },
        {
          "id": "spelling-grammar",
          "name": "Spelling & Grammar",
          "status": "pass" | "issue" | "warning",
          "score": number (0-100),
          "description": "Flawless grammar and spelling reflect high attention to detail and professionalism.",
          "findings": string,
          "recommendation": string
        },
        {
          "id": "bullets-consistency",
          "name": "Bullets Consistency",
          "status": "pass" | "issue" | "warning",
          "score": number (0-100),
          "description": "Consistent bullet structure (action verb + task + outcome) and concise length make reading effortless.",
          "findings": string,
          "recommendation": string
        }
      ]
    },
    {
      "id": "sections",
      "name": "SECTIONS",
      "score": number (integer 0-100),
      "issueCount": number,
      "items": [
        {
          "id": "contact-info",
          "name": "Contact Information",
          "status": "pass" | "issue" | "warning",
          "score": number (0-100),
          "description": "Must include full name, phone number, professional email, location (city/state), and LinkedIn profile link.",
          "findings": string,
          "recommendation": string
        },
        {
          "id": "summary-objective",
          "name": "Professional Summary",
          "status": "pass" | "issue" | "warning",
          "score": number (0-100),
          "description": "A compelling 2-3 sentence elevator pitch summarizing your career expertise and value.",
          "findings": string,
          "recommendation": string
        },
        {
          "id": "work-experience",
          "name": "Work Experience",
          "status": "pass" | "issue" | "warning",
          "score": number (0-100),
          "description": "Clear reverse-chronological structure with job titles, company names, dates, and bulleted duties.",
          "findings": string,
          "recommendation": string
        },
        {
          "id": "education-certs",
          "name": "Education & Certifications",
          "status": "pass" | "issue" | "warning",
          "score": number (0-100),
          "description": "Degree, major, institution, graduation year, plus relevant credentials.",
          "findings": string,
          "recommendation": string
        },
        {
          "id": "skills-section",
          "name": "Skills Alignment",
          "status": "pass" | "issue" | "warning",
          "score": number (0-100),
          "description": "Grouped hard and soft skills that match target job requirements.",
          "findings": string,
          "recommendation": string
        }
      ]
    },
    {
      "id": "ats-essentials",
      "name": "ATS ESSENTIALS",
      "score": number (integer 0-100),
      "issueCount": number,
      "items": [
        {
          "id": "file-structure",
          "name": "Layout & Flow",
          "status": "pass" | "issue" | "warning",
          "score": number (0-100),
          "description": "Clean single-column structure without complex tables, columns, or graphics that break ATS parsing.",
          "findings": string,
          "recommendation": string
        },
        {
          "id": "standard-headings",
          "name": "Standard Headings",
          "status": "pass" | "issue" | "warning",
          "score": number (0-100),
          "description": "Uses standard headers (e.g., 'Work Experience', 'Education', 'Skills') recognized by ATS bots.",
          "findings": string,
          "recommendation": string
        },
        {
          "id": "date-formatting",
          "name": "Date Formatting",
          "status": "pass" | "issue" | "warning",
          "score": number (0-100),
          "description": "Standardized date formats (e.g., MM/YYYY or Month Year) for proper tenure parsing.",
          "findings": string,
          "recommendation": string
        }
      ]
    }
  ],
  "strengths": [string, string, string],
  "weaknesses": [string, string],
  "topFixes": [string, string, string]
}`;

    // Call AI with JSON output mode
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const rawContent =
      response.text ||
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "{}";

    let parsedData;
    try {
      parsedData = JSON.parse(rawContent);
    } catch {
      // Fallback in case response had surrounding markdown code fences
      const cleaned = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedData = JSON.parse(cleaned);
    }

    const content = JSON.stringify(parsedData);

    // Save result in database
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Resume review', ${content}, 'resume-review')
    `;

    res.json({
      success: true,
      content,
      data: parsedData,
    });
  } catch (error) {
    console.error("Resume review error:", error.message);
    res.json({
      success: false,
      message: error.message,
    });
  } finally {
    // Delete file after reading
    if (resume?.path && fs.existsSync(resume.path)) {
      try {
        fs.unlinkSync(resume.path);
      } catch (cleanupError) {
        console.error("Failed to delete temp file:", cleanupError.message);
      }
    }
  }
};

