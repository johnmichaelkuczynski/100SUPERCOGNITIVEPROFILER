import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy, Download, Upload } from 'lucide-react';

export default function TextCleaner() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Comprehensive text cleaning function
  const cleanText = (text: string): string => {
    if (!text) return '';

    let cleaned = text;

    // Remove invisible control characters
    cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, ''); // Zero-width chars
    cleaned = cleaned.replace(/[\u2028\u2029]/g, '\n'); // Line/paragraph separators
    cleaned = cleaned.replace(/[\u00AD]/g, ''); // Soft hyphens
    cleaned = cleaned.replace(/[\u061C]/g, ''); // Arabic letter mark
    cleaned = cleaned.replace(/[\u180E]/g, ''); // Mongolian vowel separator
    cleaned = cleaned.replace(/[\u2060]/g, ''); // Word joiner
    cleaned = cleaned.replace(/[\u2061-\u2064]/g, ''); // Function application/invisible operators

    // Convert smart quotes to straight quotes
    cleaned = cleaned.replace(/[\u2018\u2019]/g, "'"); // Single quotes
    cleaned = cleaned.replace(/[\u201C\u201D]/g, '"'); // Double quotes
    cleaned = cleaned.replace(/[\u2032\u2033]/g, "'"); // Prime marks

    // Convert other smart punctuation
    cleaned = cleaned.replace(/[\u2013\u2014]/g, '-'); // En/em dashes to hyphens
    cleaned = cleaned.replace(/[\u2026]/g, '...'); // Ellipsis to three dots
    cleaned = cleaned.replace(/[\u00B7]/g, '·'); // Middle dot

    // Replace non-breaking spaces with regular spaces
    cleaned = cleaned.replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, ' ');

    // Normalize Unicode to NFKC form (canonical decomposition + compatibility)
    if (cleaned.normalize) {
      cleaned = cleaned.normalize('NFKC');
    }

    // Normalize whitespace while preserving intentional line breaks
    // Replace multiple spaces with single space
    cleaned = cleaned.replace(/ {2,}/g, ' ');
    
    // Normalize line endings to \n
    cleaned = cleaned.replace(/\r\n/g, '\n');
    cleaned = cleaned.replace(/\r/g, '\n');
    
    // Remove trailing spaces at end of lines
    cleaned = cleaned.replace(/ +$/gm, '');
    
    // Collapse multiple empty lines to maximum of 2
    cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n');

    // Remove leading/trailing whitespace from entire text
    cleaned = cleaned.trim();

    return cleaned;
  };

  const handleClean = () => {
    setIsProcessing(true);
    try {
      const result = cleanText(inputText);
      setOutputText(result);
      
      toast({
        title: "Text Cleaned",
        description: `Processed ${inputText.length} characters → ${result.length} characters`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clean text",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      toast({
        title: "Copied",
        description: "Clean text copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy text",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cleaned-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "Clean text saved as cleaned-text.txt",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInputText(content);
    };
    reader.readAsText(file);
  };

  const inputWordCount = inputText.trim().split(/\s+/).filter(word => word.length > 0).length;
  const outputWordCount = outputText.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Text Cleaner Utility</CardTitle>
          <CardDescription>
            Remove hidden formatting artifacts, normalize spacing, and clean text without altering content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="input-text" className="text-lg font-semibold">
                Input Text
              </Label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
              </div>
            </div>
            <Textarea
              id="input-text"
              placeholder="Paste text with hidden formatting artifacts here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
            <div className="text-sm text-gray-500">
              {inputWordCount} words | {inputText.length} characters
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleClean}
              disabled={!inputText.trim() || isProcessing}
              size="lg"
              className="px-8"
            >
              {isProcessing ? 'Cleaning...' : 'Clean Text'}
            </Button>
          </div>

          {/* Output Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="output-text" className="text-lg font-semibold">
                Clean Output
              </Label>
              {outputText && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              )}
            </div>
            <Textarea
              id="output-text"
              placeholder="Cleaned text will appear here..."
              value={outputText}
              readOnly
              className="min-h-[200px] font-mono text-sm bg-gray-50"
            />
            {outputText && (
              <div className="text-sm text-gray-500">
                {outputWordCount} words | {outputText.length} characters
                {inputText.length !== outputText.length && (
                  <span className={`ml-2 font-medium ${outputText.length < inputText.length ? 'text-green-600' : 'text-orange-600'}`}>
                    ({outputText.length > inputText.length ? '+' : ''}{outputText.length - inputText.length} chars)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Feature List */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border">
            <h3 className="font-semibold text-blue-800 mb-3">Text Cleaning Features:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
              <div>✓ Strip hidden formatting artifacts</div>
              <div>✓ Normalize spacing and punctuation</div>
              <div>✓ Convert smart quotes to straight quotes</div>
              <div>✓ Replace non-breaking spaces</div>
              <div>✓ Remove invisible control characters</div>
              <div>✓ Normalize Unicode to NFKC form</div>
              <div>✓ Preserve line/paragraph breaks</div>
              <div>✓ No content alteration or rewording</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}