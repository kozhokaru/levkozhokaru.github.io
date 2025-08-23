// Admin Panel JavaScript

// State management
let contentBlocks = [];
let references = [];
let blockIdCounter = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
  setDefaultDate();
  loadDraftIfExists();
  updatePreview();
});

// Event Listeners
function initializeEventListeners() {
  // Metadata inputs
  document.getElementById('postTitle').addEventListener('input', updatePreview);
  document
    .getElementById('postCategory')
    .addEventListener('change', updatePreview);
  document.getElementById('postDate').addEventListener('change', updatePreview);
  document
    .getElementById('postExcerpt')
    .addEventListener('input', updatePreview);
  document
    .getElementById('heroColor')
    .addEventListener('change', updatePreview);
  document.getElementById('heroEmoji').addEventListener('input', updatePreview);

  // Buttons
  document
    .getElementById('addBlock')
    .addEventListener('click', addContentBlock);
  document
    .getElementById('addReference')
    .addEventListener('click', addReference);
  document
    .getElementById('generatePost')
    .addEventListener('click', generatePost);
  document.getElementById('saveDraft').addEventListener('click', saveDraft);
  document.getElementById('loadDraft').addEventListener('click', loadDraft);
  document.getElementById('clearAll').addEventListener('click', clearAll);
  document
    .getElementById('refreshPreview')
    .addEventListener('click', updatePreview);

  // Output panel
  document.getElementById('closeOutput').addEventListener('click', () => {
    document.getElementById('outputPanel').style.display = 'none';
  });

  document
    .getElementById('downloadPost')
    .addEventListener('click', downloadPost);

  // Copy buttons
  document.querySelectorAll('.btn-copy').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      copyToClipboard(e.target.dataset.target);
    });
  });
}

// Set default date to today
function setDefaultDate() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('postDate').value = today;
}

// Content Block Management
function addContentBlock(type = 'paragraph') {
  const blockId = `block-${blockIdCounter++}`;
  const template = document.getElementById('blockTemplate');
  const block = template.content.cloneNode(true);

  const blockElement = block.querySelector('.content-block');
  blockElement.dataset.blockId = blockId;

  // Set block type
  const typeSelect = block.querySelector('.block-type');
  typeSelect.value = type;
  typeSelect.addEventListener('change', (e) => {
    updateBlockContent(blockId, e.target.value);
    updatePreview();
  });

  // Block actions
  block
    .querySelector('.btn-move-up')
    .addEventListener('click', () => moveBlock(blockId, -1));
  block
    .querySelector('.btn-move-down')
    .addEventListener('click', () => moveBlock(blockId, 1));
  block
    .querySelector('.btn-delete')
    .addEventListener('click', () => deleteBlock(blockId));

  // Add to DOM
  document.getElementById('contentBlocks').appendChild(block);

  // Initialize content
  updateBlockContent(blockId, type);

  // Add to state
  contentBlocks.push({
    id: blockId,
    type: type,
    content: '',
  });

  updatePreview();
}

function updateBlockContent(blockId, type) {
  const block = document.querySelector(`[data-block-id="${blockId}"]`);
  const contentDiv = block.querySelector('.block-content');

  let contentHTML = '';

  switch (type) {
    case 'paragraph':
      contentHTML = `<textarea placeholder="Enter paragraph text..." class="paragraph-content"></textarea>`;
      break;

    case 'heading':
      contentHTML = `
                <div class="heading-level">
                    <select class="heading-size">
                        <option value="h2">Heading 2 (H2)</option>
                        <option value="h3">Heading 3 (H3)</option>
                    </select>
                </div>
                <input type="text" placeholder="Enter heading text..." class="heading-content">
            `;
      break;

    case 'image':
      contentHTML = `
                <div class="image-upload-area">
                    <input type="file" accept="image/*" class="image-input" style="display: none;">
                    <button class="btn-secondary image-upload-btn">Choose Image</button>
                    <p style="margin-top: 10px; font-size: 0.875rem; color: var(--color-text-muted);">or drag and drop</p>
                </div>
                <div class="image-preview" style="display: none;">
                    <img src="" alt="Preview">
                </div>
                <input type="text" placeholder="Image caption (optional)" class="image-caption" style="display: none;">
            `;
      break;

    case 'video':
      contentHTML = `
                <div class="video-input-area">
                    <input type="url" placeholder="Paste YouTube URL (e.g., https://www.youtube.com/watch?v=...)" class="video-url-input">
                    <button class="btn-secondary video-validate">Validate URL</button>
                </div>
                <div class="video-preview" style="display: none;">
                    <div class="video-thumbnail">
                        <img src="" alt="Video thumbnail">
                        <div class="video-play-overlay">▶</div>
                    </div>
                    <div class="video-info">
                        <span class="video-id"></span>
                    </div>
                </div>
                <input type="text" placeholder="Video caption (optional)" class="video-caption" style="display: none;">
                <div class="video-error" style="display: none; color: var(--color-text-error); font-size: 0.875rem; margin-top: 0.5rem;"></div>
            `;
      break;

    case 'code':
      contentHTML = `
                <div class="code-language">
                    <select class="language-select">
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                        <option value="typescript">TypeScript</option>
                        <option value="go">Go</option>
                        <option value="rust">Rust</option>
                        <option value="php">PHP</option>
                        <option value="sql">SQL</option>
                        <option value="bash">Bash</option>
                    </select>
                </div>
                <textarea placeholder="Enter code..." class="code-editor"></textarea>
            `;
      break;

    case 'quote':
      contentHTML = `
                <textarea placeholder="Enter quote text..." class="quote-content"></textarea>
                <input type="text" placeholder="Attribution (optional)" class="quote-attribution" style="margin-top: 8px;">
            `;
      break;

    case 'list':
      contentHTML = `
                <div class="list-type">
                    <select class="list-style">
                        <option value="ul">Unordered (bullets)</option>
                        <option value="ol">Ordered (numbers)</option>
                    </select>
                </div>
                <div class="list-items">
                    <div class="list-item">
                        <input type="text" placeholder="List item" class="item-text">
                        <button class="btn-add-item">+</button>
                    </div>
                </div>
            `;
      break;
  }

  contentDiv.innerHTML = contentHTML;

  // Add event listeners based on type
  if (type === 'image') {
    setupImageUpload(blockId);
  } else if (type === 'video') {
    setupVideoHandlers(blockId);
  } else if (type === 'list') {
    setupListHandlers(blockId);
  }

  // Add input listeners for live preview
  contentDiv.querySelectorAll('input, textarea, select').forEach((input) => {
    input.addEventListener('input', () => {
      updateBlockData(blockId);
      updatePreview();
    });
  });

  // Update block data
  const blockData = contentBlocks.find((b) => b.id === blockId);
  if (blockData) {
    blockData.type = type;
  }
}

function setupImageUpload(blockId) {
  const block = document.querySelector(`[data-block-id="${blockId}"]`);
  const fileInput = block.querySelector('.image-input');
  const uploadBtn = block.querySelector('.image-upload-btn');
  const uploadArea = block.querySelector('.image-upload-area');
  const preview = block.querySelector('.image-preview');
  const caption = block.querySelector('.image-caption');

  uploadBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    handleImageFile(e.target.files[0], blockId);
  });

  // Drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.backgroundColor = 'var(--color-bg-white)';
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.backgroundColor = 'var(--color-bg-primary)';
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.backgroundColor = 'var(--color-bg-primary)';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageFile(file, blockId);
    }
  });
}

function handleImageFile(file, blockId) {
  if (!file || !file.type.startsWith('image/')) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const block = document.querySelector(`[data-block-id="${blockId}"]`);
    const preview = block.querySelector('.image-preview');
    const img = preview.querySelector('img');
    const caption = block.querySelector('.image-caption');
    const uploadArea = block.querySelector('.image-upload-area');

    img.src = e.target.result;
    preview.style.display = 'block';
    caption.style.display = 'block';
    uploadArea.style.display = 'none';

    // Update block data
    const blockData = contentBlocks.find((b) => b.id === blockId);
    if (blockData) {
      blockData.imageData = e.target.result;
    }

    updatePreview();
  };
  reader.readAsDataURL(file);
}

// YouTube URL parser
function parseYouTubeUrl(url) {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})(?:&t=(\d+))?/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?t=(\d+))?/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(?:\?start=(\d+))?/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        videoId: match[1],
        timestamp: match[2] || null
      };
    }
  }
  
  return null;
}

// Setup video handlers
function setupVideoHandlers(blockId) {
  const block = document.querySelector(`[data-block-id="${blockId}"]`);
  const urlInput = block.querySelector('.video-url-input');
  const validateBtn = block.querySelector('.video-validate');
  const preview = block.querySelector('.video-preview');
  const caption = block.querySelector('.video-caption');
  const errorDiv = block.querySelector('.video-error');
  
  const validateVideo = () => {
    const url = urlInput.value.trim();
    if (!url) {
      errorDiv.textContent = 'Please enter a YouTube URL';
      errorDiv.style.display = 'block';
      preview.style.display = 'none';
      return;
    }
    
    const parsed = parseYouTubeUrl(url);
    if (!parsed) {
      errorDiv.textContent = 'Invalid YouTube URL. Please use a valid YouTube video link.';
      errorDiv.style.display = 'block';
      preview.style.display = 'none';
      return;
    }
    
    // Valid URL - show preview
    errorDiv.style.display = 'none';
    const thumbnail = preview.querySelector('img');
    thumbnail.src = `https://img.youtube.com/vi/${parsed.videoId}/maxresdefault.jpg`;
    
    // Fallback to lower quality if maxresdefault doesn't exist
    thumbnail.onerror = () => {
      thumbnail.src = `https://img.youtube.com/vi/${parsed.videoId}/hqdefault.jpg`;
    };
    
    preview.querySelector('.video-id').textContent = `Video ID: ${parsed.videoId}`;
    preview.style.display = 'block';
    caption.style.display = 'block';
    
    // Update block data
    const blockData = contentBlocks.find((b) => b.id === blockId);
    if (blockData) {
      blockData.videoId = parsed.videoId;
      blockData.videoUrl = url;
      blockData.timestamp = parsed.timestamp;
    }
    
    updatePreview();
  };
  
  validateBtn.addEventListener('click', validateVideo);
  urlInput.addEventListener('paste', () => {
    setTimeout(validateVideo, 100);
  });
  
  urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      validateVideo();
    }
  });
  
  caption.addEventListener('input', () => {
    const blockData = contentBlocks.find((b) => b.id === blockId);
    if (blockData) {
      blockData.caption = caption.value;
    }
    updatePreview();
  });
}

function setupListHandlers(blockId) {
  const block = document.querySelector(`[data-block-id="${blockId}"]`);
  const addBtn = block.querySelector('.btn-add-item');

  addBtn.addEventListener('click', () => {
    const listItems = block.querySelector('.list-items');
    const newItem = document.createElement('div');
    newItem.className = 'list-item';
    newItem.innerHTML = `
            <input type="text" placeholder="List item" class="item-text">
            <button class="btn-remove-item">−</button>
        `;

    const lastItem = listItems.lastElementChild;
    listItems.insertBefore(newItem, lastItem);

    newItem.querySelector('.btn-remove-item').addEventListener('click', () => {
      newItem.remove();
      updateBlockData(blockId);
      updatePreview();
    });

    newItem.querySelector('.item-text').addEventListener('input', () => {
      updateBlockData(blockId);
      updatePreview();
    });
  });
}

function updateBlockData(blockId) {
  const block = document.querySelector(`[data-block-id="${blockId}"]`);
  const blockData = contentBlocks.find((b) => b.id === blockId);
  if (!blockData) return;

  switch (blockData.type) {
    case 'paragraph':
      blockData.content = block.querySelector('.paragraph-content').value;
      break;

    case 'heading':
      blockData.level = block.querySelector('.heading-size').value;
      blockData.content = block.querySelector('.heading-content').value;
      break;

    case 'image':
      blockData.caption = block.querySelector('.image-caption').value;
      break;

    case 'video':
      const videoCaption = block.querySelector('.video-caption');
      if (videoCaption) {
        blockData.caption = videoCaption.value;
      }
      break;

    case 'code':
      blockData.language = block.querySelector('.language-select').value;
      blockData.content = block.querySelector('.code-editor').value;
      break;

    case 'quote':
      blockData.content = block.querySelector('.quote-content').value;
      blockData.attribution = block.querySelector('.quote-attribution').value;
      break;

    case 'list':
      blockData.listType = block.querySelector('.list-style').value;
      blockData.items = Array.from(block.querySelectorAll('.item-text'))
        .map((input) => input.value)
        .filter((val) => val.trim());
      break;
  }
}

function moveBlock(blockId, direction) {
  const index = contentBlocks.findIndex((b) => b.id === blockId);
  const newIndex = index + direction;

  if (newIndex < 0 || newIndex >= contentBlocks.length) return;

  // Swap in array
  [contentBlocks[index], contentBlocks[newIndex]] = [
    contentBlocks[newIndex],
    contentBlocks[index],
  ];

  // Reorder DOM
  const blocksContainer = document.getElementById('contentBlocks');
  const block = document.querySelector(`[data-block-id="${blockId}"]`);
  const allBlocks = Array.from(blocksContainer.children);

  if (direction === -1 && index > 0) {
    blocksContainer.insertBefore(block, allBlocks[index - 1]);
  } else if (direction === 1 && index < allBlocks.length - 1) {
    blocksContainer.insertBefore(allBlocks[index + 1], block);
  }

  updatePreview();
}

function deleteBlock(blockId) {
  contentBlocks = contentBlocks.filter((b) => b.id !== blockId);
  document.querySelector(`[data-block-id="${blockId}"]`).remove();
  updatePreview();
}

// References Management
function addReference() {
  const template = document.getElementById('referenceTemplate');
  const ref = template.content.cloneNode(true);

  const deleteBtn = ref.querySelector('.btn-delete-ref');
  deleteBtn.addEventListener('click', (e) => {
    e.target.closest('.reference-item').remove();
    updateReferences();
  });

  ref.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', updateReferences);
  });

  document.getElementById('references').appendChild(ref);
  updateReferences();
}

function updateReferences() {
  references = Array.from(document.querySelectorAll('.reference-item'))
    .map((item) => ({
      title: item.querySelector('.ref-title').value,
      url: item.querySelector('.ref-url').value,
    }))
    .filter((ref) => ref.title || ref.url);

  updatePreview();
}

// Preview Generation
function updatePreview() {
  const previewContent = document.getElementById('previewContent');

  const title = document.getElementById('postTitle').value;
  const category = document.getElementById('postCategory').value;
  const date = formatDate(document.getElementById('postDate').value);
  const heroColor = document.getElementById('heroColor').value;
  const heroEmoji = document.getElementById('heroEmoji').value || '📝';

  if (!title && contentBlocks.length === 0) {
    previewContent.innerHTML =
      '<div class="preview-empty">Start adding content to see the preview</div>';
    updateReadingTime(0);
    return;
  }

  let html = `
        <div class="post-hero-section ${heroColor}">
            <div class="post-hero-illustration">${heroEmoji}</div>
        </div>
        
        <div class="post-article">
            <header class="post-header">
                ${
                  category
                    ? `<div class="post-meta-top"><span class="post-category-badge">${category}</span></div>`
                    : ''
                }
                <h1 class="post-full-title">${title || 'Untitled Post'}</h1>
                <div class="post-meta-bottom">
                    <span>${date}</span>
                    <span class="separator">•</span>
                    <span><span id="previewReadTime">0</span> min read</span>
                </div>
            </header>
            
            <div class="post-content">
    `;

  // Add content blocks
  contentBlocks.forEach((block, index) => {
    const prevBlock = contentBlocks[index - 1];
    const nextBlock = contentBlocks[index + 1];

    // Add margin if image is between text blocks
    if (block.type === 'image') {
      if (
        prevBlock &&
        ['paragraph', 'heading', 'list'].includes(prevBlock.type)
      ) {
        html += '<div style="margin-top: 2rem;"></div>';
      }
    }

    html += generateBlockHTML(block);

    if (block.type === 'image') {
      if (
        nextBlock &&
        ['paragraph', 'heading', 'list'].includes(nextBlock.type)
      ) {
        html += '<div style="margin-bottom: 2rem;"></div>';
      }
    }
  });

  // Add references if any
  if (references.length > 0) {
    html += '<h2>References</h2><ul>';
    references.forEach((ref) => {
      if (ref.title && ref.url) {
        html += `<li><a href="${ref.url}" target="_blank">${ref.title}</a></li>`;
      }
    });
    html += '</ul>';
  }

  html += `
            </div>
        </div>
    `;

  previewContent.innerHTML = html;

  // Update reading time
  const wordCount = calculateWordCount();
  updateReadingTime(wordCount);
}

function generateBlockHTML(block) {
  switch (block.type) {
    case 'paragraph':
      return `<p>${escapeHtml(block.content || '')}</p>`;

    case 'heading':
      const level = block.level || 'h2';
      return `<${level}>${escapeHtml(block.content || '')}</${level}>`;

    case 'image':
      if (!block.imageData) return '';
      return `
                <figure style="margin: 1.5rem 0;">
                    <img src="${block.imageData}" alt="${escapeHtml(
        block.caption || ''
      )}" style="max-width: 100%; border-radius: 8px;">
                    ${
                      block.caption
                        ? `<figcaption style="text-align: center; color: var(--color-text-muted); font-size: 0.875rem; margin-top: 0.5rem;">${escapeHtml(
                            block.caption
                          )}</figcaption>`
                        : ''
                    }
                </figure>
            `;

    case 'video':
      if (!block.videoId) return '';
      const videoUrl = `https://www.youtube-nocookie.com/embed/${block.videoId}${block.timestamp ? `?start=${block.timestamp}` : ''}`;
      return `
                <figure style="margin: 2rem 0;">
                    <div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px;">
                        <iframe 
                            src="${videoUrl}"
                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen
                            loading="lazy">
                        </iframe>
                    </div>
                    ${
                      block.caption
                        ? `<figcaption style="text-align: center; color: var(--color-text-muted); font-size: 0.875rem; margin-top: 0.5rem;">${escapeHtml(
                            block.caption
                          )}</figcaption>`
                        : ''
                    }
                </figure>
            `;

    case 'code':
      return `<pre><code>${escapeHtml(block.content || '')}</code></pre>`;

    case 'quote':
      return `
                <blockquote>
                    ${escapeHtml(block.content || '')}
                    ${
                      block.attribution
                        ? `<cite>- ${escapeHtml(block.attribution)}</cite>`
                        : ''
                    }
                </blockquote>
            `;

    case 'list':
      if (!block.items || block.items.length === 0) return '';
      const listTag = block.listType || 'ul';
      const items = block.items
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join('');
      return `<${listTag}>${items}</${listTag}>`;

    default:
      return '';
  }
}

// Post Generation
async function generatePost() {
  const title = document.getElementById('postTitle').value;
  const category = document.getElementById('postCategory').value;
  const date = document.getElementById('postDate').value;
  const excerpt = document.getElementById('postExcerpt').value;

  // Show progress modal
  showProgressModal();

  try {
    // Step 1: Validate inputs
    await updateProgress('validate', 20, 'Validating inputs...');

    if (!title || !category || !date) {
      throw new Error(
        'Please fill in all required fields: Title, Category, and Date'
      );
    }

    if (contentBlocks.length === 0) {
      throw new Error('Please add at least one content block');
    }

    // Step 2: Process content blocks
    await updateProgress('process', 40, 'Processing content blocks...');
    await delay(300);

    // Step 3: Generate HTML
    await updateProgress('html', 60, 'Generating HTML...');
    const postHtml = generatePostHTML();
    await delay(300);

    // Step 4: Create index snippet
    await updateProgress('index', 80, 'Creating index snippet...');
    const indexCard = generateIndexCard();
    await delay(300);

    // Step 5: Prepare download
    await updateProgress('prepare', 100, 'Preparing download...');

    // Display output
    document.getElementById('postHtmlOutput').value = postHtml;
    document.getElementById('indexHtmlOutput').value = indexCard;

    // Generate filename
    const filename =
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50) + '.html';
    document.getElementById('suggestedFilename').textContent = filename;

    await delay(300);

    // Show success
    await showSuccess();

    // Close modal and show output after success
    setTimeout(() => {
      closeProgressModal();
      document.getElementById('outputPanel').style.display = 'block';
    }, 1500);
  } catch (error) {
    showProgressError(error.message);
  }
}

// Progress Modal Functions
function showProgressModal() {
  const modal = document.getElementById('progressModal');
  modal.style.display = 'flex';

  // Reset progress
  document.getElementById('progressBar').style.width = '0%';
  document.getElementById('progressPercent').textContent = '0';
  document.getElementById('progressMessage').textContent = '';
  document.getElementById('progressMessage').className = 'progress-message';
  document.getElementById('progressError').style.display = 'none';

  // Reset all steps
  document.querySelectorAll('.progress-step').forEach((step) => {
    step.className = 'progress-step';
    step.querySelector('.step-icon').textContent = '○';
  });

  // Add escape key listener
  document.addEventListener('keydown', handleEscapeKey);
}

function closeProgressModal() {
  document.getElementById('progressModal').style.display = 'none';
  document.removeEventListener('keydown', handleEscapeKey);
}

function handleEscapeKey(e) {
  if (e.key === 'Escape') {
    closeProgressModal();
  }
}

async function updateProgress(stepId, percentage, message) {
  // Update progress bar
  document.getElementById('progressBar').style.width = `${percentage}%`;
  document.getElementById('progressPercent').textContent = percentage;

  // Update message
  document.getElementById('progressMessage').textContent = message;

  // Update steps
  const steps = document.querySelectorAll('.progress-step');
  steps.forEach((step) => {
    if (step.dataset.step === stepId) {
      // Mark current as active
      step.className = 'progress-step active';
      const icon = step.querySelector('.step-icon');
      icon.innerHTML = ''; // Clear content for CSS animation
    } else {
      // Check if this step should be completed
      const stepOrder = ['validate', 'process', 'html', 'index', 'prepare'];
      const currentIndex = stepOrder.indexOf(stepId);
      const thisIndex = stepOrder.indexOf(step.dataset.step);

      if (thisIndex < currentIndex) {
        step.className = 'progress-step completed';
        step.querySelector('.step-icon').innerHTML = '';
      }
    }
  });

  await delay(100); // Small delay for visual effect
}

async function showSuccess() {
  // Mark last step as completed
  const lastStep = document.querySelector('[data-step="prepare"]');
  lastStep.className = 'progress-step completed';
  lastStep.querySelector('.step-icon').innerHTML = '';

  // Show success message
  const messageDiv = document.getElementById('progressMessage');
  messageDiv.className = 'progress-message success';
  messageDiv.innerHTML =
    '<div class="success-checkmark">✓</div><div>Post generated successfully!</div>';
}

function showProgressError(message) {
  const errorDiv = document.getElementById('progressError');
  errorDiv.querySelector('.error-message').textContent = message;
  errorDiv.style.display = 'block';

  // Hide progress elements
  document.querySelector('.progress-bar-container').style.display = 'none';
  document.querySelector('.progress-percentage').style.display = 'none';
  document.querySelector('.progress-steps').style.display = 'none';
  document.getElementById('progressMessage').style.display = 'none';
}

// Utility function for delays
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generatePostHTML() {
  const title = document.getElementById('postTitle').value;
  const category = document.getElementById('postCategory').value;
  const date = formatDate(document.getElementById('postDate').value);
  const heroColor = document.getElementById('heroColor').value;
  const heroEmoji = document.getElementById('heroEmoji').value || '📝';
  const readTime = Math.ceil(calculateWordCount() / 200);

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)} | Personal Blog</title>
    <link rel="stylesheet" href="../styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <nav class="navbar">
        <div class="container">
            <div class="nav-content">
                <a href="../index.html" class="logo">Lev Kozhokaru's Blog</a>
                <div class="nav-links">
                    <a href="../index.html">Blog</a>
                    <a href="#projects">Projects</a>
                    <a href="#research">Research</a>
                    <a href="#about">About</a>
                    <a href="#contact" class="nav-cta">Get in Touch</a>
                </div>
            </div>
        </div>
    </nav>

    <main class="main-content">
        <div class="container">
            <a href="../index.html" class="back-link">← Back to all posts</a>
            
            <article class="blog-post">
                <div class="post-hero-section ${heroColor}">
                    <div class="post-hero-illustration">${heroEmoji}</div>
                </div>
                
                <div class="post-article">
                    <header class="post-header">
                        <div class="post-meta-top">
                            <span class="post-category-badge">${escapeHtml(
                              category
                            )}</span>
                        </div>
                        <h1 class="post-full-title">${escapeHtml(title)}</h1>
                        <div class="post-meta-bottom">
                            <span>${date}</span>
                            <span class="separator">•</span>
                            <span>${readTime} min read</span>
                        </div>
                    </header>

                    <div class="post-content">`;

  // Add content blocks
  contentBlocks.forEach((block, index) => {
    const prevBlock = contentBlocks[index - 1];
    const nextBlock = contentBlocks[index + 1];

    // Add proper spacing for images
    if (block.type === 'image') {
      if (
        prevBlock &&
        ['paragraph', 'heading', 'list'].includes(prevBlock.type)
      ) {
        html += '\n\n';
      }
    }

    html += '\n                        ' + generateBlockHTML(block);

    if (block.type === 'image') {
      if (
        nextBlock &&
        ['paragraph', 'heading', 'list'].includes(nextBlock.type)
      ) {
        html += '\n\n';
      }
    }
  });

  // Add references
  if (references.length > 0) {
    html +=
      '\n\n                        <h2>References</h2>\n                        <ul>';
    references.forEach((ref) => {
      if (ref.title && ref.url) {
        html += `\n                            <li><a href="${escapeHtml(
          ref.url
        )}" target="_blank">${escapeHtml(ref.title)}</a></li>`;
      }
    });
    html += '\n                        </ul>';
  }

  html += `
                    </div>
                </div>
            </article>
        </div>
    </main>

    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-links">
                    <a href="#privacy">Privacy</a>
                    <a href="#terms">Terms</a>
                    <a href="https://github.com" target="_blank">GitHub</a>
                    <a href="https://twitter.com" target="_blank">Twitter</a>
                    <a href="https://linkedin.com" target="_blank">LinkedIn</a>
                </div>
                <p class="footer-copyright">© 2025 Personal Blog. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script src="../script.js"></script>
</body>
</html>`;

  return html;
}

function generateIndexCard() {
  const title = document.getElementById('postTitle').value;
  const category = document.getElementById('postCategory').value;
  const date = formatDate(document.getElementById('postDate').value);
  const excerpt =
    document.getElementById('postExcerpt').value ||
    (contentBlocks[0] && contentBlocks[0].type === 'paragraph'
      ? contentBlocks[0].content.substring(0, 150) + '...'
      : 'Read more about this topic...');
  const heroColor = document.getElementById('heroColor').value;
  const heroEmoji = document.getElementById('heroEmoji').value || '📝';
  const readTime = Math.ceil(calculateWordCount() / 200);

  const filename =
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50) + '.html';

  return `                    <article class="post-card">
                        <div class="post-hero ${heroColor}">
                            <div class="post-hero-icon">${heroEmoji}</div>
                        </div>
                        <div class="post-card-content">
                            <span class="post-category">${escapeHtml(
                              category
                            )}</span>
                            <h3 class="post-card-title">
                                <a href="posts/${filename}">${escapeHtml(
    title
  )}</a>
                            </h3>
                            <p class="post-card-excerpt">
                                ${escapeHtml(excerpt)}
                            </p>
                            <div class="post-card-meta">
                                <span>${date}</span>
                                <span>•</span>
                                <span>${readTime} min read</span>
                            </div>
                        </div>
                    </article>`;
}

// Utility Functions
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function calculateWordCount() {
  let wordCount = 0;

  // Count words in title
  const title = document.getElementById('postTitle').value;
  if (title) wordCount += title.split(/\s+/).filter((w) => w).length;

  // Count words in content blocks
  contentBlocks.forEach((block) => {
    if (block.content) {
      wordCount += block.content.split(/\s+/).filter((w) => w).length;
    }
    if (block.items) {
      block.items.forEach((item) => {
        wordCount += item.split(/\s+/).filter((w) => w).length;
      });
    }
    if (block.caption) {
      wordCount += block.caption.split(/\s+/).filter((w) => w).length;
    }
  });

  return wordCount;
}

function updateReadingTime(wordCount) {
  const minutes = Math.ceil(wordCount / 200) || 0;
  document.getElementById('readingTime').textContent = `${minutes} min`;
  const previewTime = document.getElementById('previewReadTime');
  if (previewTime) previewTime.textContent = minutes;
}

// Copy to Clipboard
function copyToClipboard(targetId) {
  const textarea = document.getElementById(targetId);
  textarea.select();
  document.execCommand('copy');

  // Visual feedback
  const button = document.querySelector(`[data-target="${targetId}"]`);
  const originalText = button.textContent;
  button.textContent = 'Copied!';
  button.classList.add('copied');

  setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove('copied');
  }, 2000);
}

// Download Post
function downloadPost() {
  const html = document.getElementById('postHtmlOutput').value;
  const title = document.getElementById('postTitle').value;
  const filename =
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50) + '.html';

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Draft Management
function saveDraft() {
  const draft = {
    title: document.getElementById('postTitle').value,
    category: document.getElementById('postCategory').value,
    date: document.getElementById('postDate').value,
    excerpt: document.getElementById('postExcerpt').value,
    heroColor: document.getElementById('heroColor').value,
    heroEmoji: document.getElementById('heroEmoji').value,
    contentBlocks: contentBlocks,
    references: references,
  };

  localStorage.setItem('blogPostDraft', JSON.stringify(draft));
  alert('Draft saved successfully!');
}

function loadDraft() {
  const draftString = localStorage.getItem('blogPostDraft');
  if (!draftString) {
    alert('No draft found');
    return;
  }

  const draft = JSON.parse(draftString);

  // Load metadata
  document.getElementById('postTitle').value = draft.title || '';
  document.getElementById('postCategory').value = draft.category || '';
  document.getElementById('postDate').value = draft.date || '';
  document.getElementById('postExcerpt').value = draft.excerpt || '';
  document.getElementById('heroColor').value = draft.heroColor || 'orange';
  document.getElementById('heroEmoji').value = draft.heroEmoji || '';

  // Clear existing blocks
  document.getElementById('contentBlocks').innerHTML = '';
  contentBlocks = [];

  // Load content blocks
  draft.contentBlocks.forEach((blockData) => {
    addContentBlock(blockData.type);
    const block = contentBlocks[contentBlocks.length - 1];
    Object.assign(block, blockData);

    // Restore block content in UI
    const blockElement = document.querySelector(
      `[data-block-id="${block.id}"]`
    );
    restoreBlockUI(blockElement, blockData);
  });

  // Load references
  document.getElementById('references').innerHTML = '';
  references = [];
  draft.references.forEach((ref) => {
    addReference();
    const refItems = document.querySelectorAll('.reference-item');
    const lastRef = refItems[refItems.length - 1];
    lastRef.querySelector('.ref-title').value = ref.title || '';
    lastRef.querySelector('.ref-url').value = ref.url || '';
  });

  updatePreview();
  alert('Draft loaded successfully!');
}

function restoreBlockUI(blockElement, blockData) {
  switch (blockData.type) {
    case 'paragraph':
      blockElement.querySelector('.paragraph-content').value =
        blockData.content || '';
      break;

    case 'heading':
      blockElement.querySelector('.heading-size').value =
        blockData.level || 'h2';
      blockElement.querySelector('.heading-content').value =
        blockData.content || '';
      break;

    case 'image':
      if (blockData.imageData) {
        const preview = blockElement.querySelector('.image-preview');
        const img = preview.querySelector('img');
        const caption = blockElement.querySelector('.image-caption');
        const uploadArea = blockElement.querySelector('.image-upload-area');

        img.src = blockData.imageData;
        preview.style.display = 'block';
        caption.style.display = 'block';
        caption.value = blockData.caption || '';
        uploadArea.style.display = 'none';
      }
      break;

    case 'video':
      if (blockData.videoId) {
        const urlInput = blockElement.querySelector('.video-url-input');
        const preview = blockElement.querySelector('.video-preview');
        const thumbnail = preview.querySelector('img');
        const caption = blockElement.querySelector('.video-caption');
        
        urlInput.value = blockData.videoUrl || '';
        thumbnail.src = `https://img.youtube.com/vi/${blockData.videoId}/hqdefault.jpg`;
        preview.querySelector('.video-id').textContent = `Video ID: ${blockData.videoId}`;
        preview.style.display = 'block';
        caption.style.display = 'block';
        caption.value = blockData.caption || '';
      }
      break;

    case 'code':
      blockElement.querySelector('.language-select').value =
        blockData.language || 'javascript';
      blockElement.querySelector('.code-editor').value =
        blockData.content || '';
      break;

    case 'quote':
      blockElement.querySelector('.quote-content').value =
        blockData.content || '';
      blockElement.querySelector('.quote-attribution').value =
        blockData.attribution || '';
      break;

    case 'list':
      blockElement.querySelector('.list-style').value =
        blockData.listType || 'ul';
      if (blockData.items && blockData.items.length > 0) {
        const listItems = blockElement.querySelector('.list-items');
        listItems.innerHTML = '';

        blockData.items.forEach((item, index) => {
          const itemDiv = document.createElement('div');
          itemDiv.className = 'list-item';
          itemDiv.innerHTML = `
                        <input type="text" placeholder="List item" class="item-text" value="${escapeHtml(
                          item
                        )}">
                        <button class="btn-remove-item">−</button>
                    `;
          listItems.appendChild(itemDiv);

          itemDiv
            .querySelector('.btn-remove-item')
            .addEventListener('click', () => {
              itemDiv.remove();
              updateBlockData(blockData.id);
              updatePreview();
            });

          itemDiv.querySelector('.item-text').addEventListener('input', () => {
            updateBlockData(blockData.id);
            updatePreview();
          });
        });

        // Add the "add item" button at the end
        const addItemDiv = document.createElement('div');
        addItemDiv.className = 'list-item';
        addItemDiv.innerHTML = `
                    <input type="text" placeholder="List item" class="item-text">
                    <button class="btn-add-item">+</button>
                `;
        listItems.appendChild(addItemDiv);
        setupListHandlers(blockData.id);
      }
      break;
  }
}

function loadDraftIfExists() {
  if (localStorage.getItem('blogPostDraft')) {
    // Don't auto-load, just notify
    console.log('Draft available. Click "Load Draft" to restore.');
  }
}

function clearAll() {
  if (
    !confirm(
      'Are you sure you want to clear all content? This cannot be undone.'
    )
  ) {
    return;
  }

  // Clear form
  document.getElementById('postTitle').value = '';
  document.getElementById('postCategory').value = '';
  document.getElementById('postExcerpt').value = '';
  document.getElementById('heroEmoji').value = '';
  document.getElementById('heroColor').value = 'orange';
  setDefaultDate();

  // Clear blocks
  document.getElementById('contentBlocks').innerHTML = '';
  contentBlocks = [];

  // Clear references
  document.getElementById('references').innerHTML = '';
  references = [];

  updatePreview();
}
