import Document from "../models/Document.js";
import { generateEmbedding } from "../utils/ragUtils.js";

// Fetch all documents (exclude embeddings to save bandwidth)
export const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({}, "-embedding").sort({ createdAt: -1 });
    res.status(200).json({ success: true, documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ success: false, error: "Failed to fetch documents." });
  }
};

// Create a new document and generate its embedding
export const createDocument = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, error: "Title and content are required." });
    }

    // Generate embedding from the document's content
    const textForEmbedding = `Title: ${title}\nContent: ${content}`;
    const embedding = await generateEmbedding(textForEmbedding);

    const newDocument = new Document({
      title,
      content,
      embedding,
    });

    await newDocument.save();

    res.status(201).json({ success: true, message: "Document added successfully to Knowledge Base.", document: newDocument });
  } catch (error) {
    console.error("Error creating document:", error);
    res.status(500).json({ success: false, error: "Failed to create document." });
  }
};

// Delete a document
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedDoc = await Document.findByIdAndDelete(id);

    if (!deletedDoc) {
      return res.status(404).json({ success: false, error: "Document not found." });
    }

    res.status(200).json({ success: true, message: "Document deleted successfully." });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ success: false, error: "Failed to delete document." });
  }
};
