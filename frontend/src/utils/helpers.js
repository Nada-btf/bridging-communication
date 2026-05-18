import { 
  formatDate, 
  getRelativeTime, 
  isValidEmail, 
  validatePassword,
  copyToClipboard,
  truncate,
  capitalize
} from '../utils/helpers';

// Format a date
const formattedDate = formatDate(item.timestamp, 'full');
const relativeTime = getRelativeTime(item.timestamp);

// Validate email
if (!isValidEmail(email)) {
  showToast('Invalid email address', 'error');
}

// Validate password
const { isValid, errors } = validatePassword(password);
if (!isValid) {
  errors.forEach(err => showToast(err, 'error'));
}

// Copy to clipboard
const handleCopy = async () => {
  const success = await copyToClipboard(text);
  if (success) showToast('Copied!', 'success');
};

// Truncate long text
const shortText = truncate(longText, 50);

// Capitalize name
const displayName = capitalize(user.name);import { groupByDate } from '../utils/helpers';

const groupedHistory = groupByDate(historyItems, 'timestamp');
// Result: { "January 1, 2024": [...items], "December 31, 2023": [...items] }