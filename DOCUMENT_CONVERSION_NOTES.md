# Document Conversion Notes

## Converting Activity10_Document.md to .docx

The `Activity10_Document.md` file contains the activity document in Markdown format. To convert it to .docx format as required:

### Option 1: Using Pandoc (Recommended)
```bash
pandoc Activity10_Document.md -o Activity10_Document.docx
```

### Option 2: Using Online Converters
1. Visit: https://www.markdowntopdf.com/ or https://cloudconvert.com/md-to-docx
2. Upload `Activity10_Document.md`
3. Download the converted .docx file

### Option 3: Using Microsoft Word
1. Open Microsoft Word
2. Go to File > Open
3. Select `Activity10_Document.md`
4. Word will convert it automatically
5. Save As > Word Document (*.docx)

### Option 4: Using Google Docs
1. Upload `Activity10_Document.md` to Google Drive
2. Open with Google Docs
3. Download as Microsoft Word (.docx)

## Adding Screenshots

The document includes placeholders for screenshots:
- `screenshots/swagger-api.png` - Swagger API Documentation
- `screenshots/admin-dashboard.png` - Admin Dashboard
- `screenshots/admin-events.png` - Admin Events Management
- `screenshots/organizer-scanner.png` - Organizer QR Scanner
- `screenshots/attendee-registration.png` - Attendee Registration
- `screenshots/attendee-tickets.png` - Attendee Tickets with QR Code

**To add screenshots:**
1. Take screenshots of the working application
2. Create a `screenshots/` folder in the project root
3. Save screenshots with the filenames mentioned above
4. Replace the placeholder image paths in the document

## Final Checklist Before Submission

- [ ] Convert `Activity10_Document.md` to `.docx` format
- [ ] Add screenshots of the working system (UI + API)
- [ ] Replace placeholder image paths with actual screenshots
- [ ] Verify all instructions are accurate
- [ ] Test all setup instructions on a clean environment
- [ ] Ensure Swagger documentation is accessible at `/api`
- [ ] Verify API endpoints work correctly
- [ ] Push code to GitHub repository
- [ ] Upload Activity10_Document.docx to repository or submission portal

## GitHub Repository Structure

Your GitHub repository should have the following structure:

```
Activity10/
├── backend/
│   ├── src/
│   ├── package.json
│   └── ...
├── frontend/
│   ├── admin-app/
│   ├── organizer-app/
│   └── attendee-app/
├── screenshots/          # Add your screenshots here
│   ├── swagger-api.png
│   ├── admin-dashboard.png
│   ├── admin-events.png
│   ├── organizer-scanner.png
│   ├── attendee-registration.png
│   └── attendee-tickets.png
├── Activity10_Document.md
├── Activity10_Document.docx    # Converted document
├── README.md
├── API_DOCUMENTATION.md
└── .gitignore
```

## Notes for Submission

1. **API Documentation**: The Swagger UI at `http://localhost:4000/api` serves as the API documentation. Include a screenshot of this in your document.

2. **Screenshots Should Show**:
   - Working UI (all three apps)
   - API responses from Swagger/Postman
   - QR code generation and scanning
   - Database interactions (optional but recommended)

3. **Instructions Should Include**:
   - Step-by-step setup
   - How to create initial admin user
   - How to test all features
   - How to access Swagger documentation
