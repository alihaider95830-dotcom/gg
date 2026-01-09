# Course Slides Manager 📚

A sleek, modern web application that allows users to securely upload, organize, and download course presentation slides with a stunning glassmorphism UI design.

## ✨ Features

### Core Functionality
- **Course Management**: Create up to 5 course repositories
- **File Upload**: Batch upload 10-100 PowerPoint/PPTX files per course
- **Drag & Drop**: Intuitive drag-and-drop interface for file uploads
- **Real-time Progress**: Live upload progress indicators
- **Smart Organization**: Categorize slides by course with search and filter
- **Download System**: Individual, batch, or ZIP downloads
- **Download History**: Track all your downloads

### UI/UX Highlights
- **Glassmorphism Design**: Frosted glass effect panels with backdrop blur
- **Dark/Light Mode**: Toggle between themes with glassy adaptation
- **Smooth Animations**: Powered by Framer Motion
- **Responsive Design**: Mobile-first approach that works on all devices
- **Micro-interactions**: Delightful hover effects and transitions

## 🚀 Tech Stack

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS with custom glassmorphism utilities
- **Animations**: Framer Motion
- **File Handling**: react-dropzone, jszip
- **Icons**: Lucide React
- **Date Formatting**: date-fns

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gg
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎨 Design System

### Glassmorphism Classes
- `.glass` - Standard glass effect
- `.glass-hover` - Glass with hover effects
- `.glass-button` - Button with glass styling
- `.glass-input` - Input with glass styling

### Color Palette
- Course colors: Blue-Purple, Green-Teal, Orange-Red, Pink-Rose, Indigo-Blue
- Background gradients adapt to light/dark theme
- Semi-transparent overlays with luminous edges

## 📱 Pages

1. **Dashboard** (`/`)
   - Overview stats (courses, files, storage)
   - Course cards with quick actions
   - Create new courses

2. **Course Detail** (`/course/[id]`)
   - File grid with thumbnails
   - Search and filter functionality
   - Upload new files
   - Batch operations

## 🔧 Configuration

### File Limits
- Max courses: 5
- Max files per course: 100
- Supported formats: .ppt, .pptx

### Storage
Currently uses localStorage for data persistence. Can be easily upgraded to:
- Firebase Storage + Firestore
- AWS S3 + DynamoDB
- Custom backend API

## 🎯 Usage

### Creating a Course
1. Click "Create New Course" on the dashboard
2. Enter course name and description
3. Course is created with a random gradient color

### Uploading Files
1. Open a course
2. Click "Upload Files"
3. Drag & drop or click to browse
4. Upload progress is shown in real-time

### Downloading Files
1. Select files using checkboxes
2. Click "Download" for single file
3. Click "Download" with multiple selections for ZIP

### Search & Filter
- Use search bar to find files by name
- Sort by date, name, or size
- Real-time filtering

## 🎨 Customization

### Theme Colors
Edit `tailwind.config.ts` to customize colors:
```typescript
colors: {
  glass: {
    light: 'rgba(255, 255, 255, 0.1)',
    // Add more colors
  },
}
```

### Animations
Modify `app/globals.css` for custom animations:
```css
@keyframes shimmer {
  /* Custom animation */
}
```

## 🚧 Future Enhancements

- [ ] Cloud storage integration
- [ ] User authentication
- [ ] File preview generation
- [ ] Sharing functionality
- [ ] Analytics dashboard
- [ ] Keyboard shortcuts
- [ ] File versioning
- [ ] Collaborative features

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and Tailwind CSS
