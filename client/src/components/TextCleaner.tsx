import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, Sparkles, Eye, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cleanText, getCleaningStats, previewCleaning } from '@/utils/textCleaner';

export default function TextCleaner() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const handleClean = () => {
    if (!inputText.trim()) {
      toast({
        title: "No text to clean",
        description: "Please enter some text first.",
        variant: "destructive"
      });
      return;
    }

    const cleaned = cleanText(inputText);
    setOutputText(cleaned);
    setShowStats(true);

    toast({
      title: "Text cleaned successfully",
      description: "Formatting artifacts have been removed.",
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      toast({
        title: "Copied to clipboard",
        description: "Clean text has been copied.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cleaned-text.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "Clean text saved as cleaned-text.txt",
    });
  };

  const stats = inputText && outputText ? getCleaningStats(inputText, outputText) : null;
  const preview = inputText ? previewCleaning(inputText) : null;

  const inputWordCount = inputText.trim().split(/\s+/).filter(word => word.length > 0).length;
  const outputWordCount = outputText.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Text Cleaner
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                disabled={!inputText}
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview Issues
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStats(!showStats)}
                disabled={!stats}
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                Stats
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Remove hidden formatting artifacts and normalize text without changing content
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preview Issues */}
          {showPreview && preview && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Issues Found in Text</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {preview.invisibleChars.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Invisible Characters:</p>
                    <div className="flex flex-wrap gap-1">
                      {preview.invisibleChars.map((char, i) => (
                        <Badge key={i} variant="destructive" className="text-xs">
                          U+{char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {preview.smartQuotes.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Smart Quotes:</p>
                    <div className="flex flex-wrap gap-1">
                      {preview.smartQuotes.map((char, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          "{char}"
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {preview.specialSpaces.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Special Spaces:</p>
                    <div className="flex flex-wrap gap-1">
                      {preview.specialSpaces.map((char, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          U+{char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {preview.otherIssues.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Other Issues:</p>
                    <div className="flex flex-wrap gap-1">
                      {preview.otherIssues.map((issue, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {issue}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {preview.invisibleChars.length === 0 && 
                 preview.smartQuotes.length === 0 && 
                 preview.specialSpaces.length === 0 && 
                 preview.otherIssues.length === 0 && (
                  <p className="text-sm text-green-600">No formatting issues detected</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Input Text */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Input Text</label>
              <span className="text-xs text-gray-500">
                {inputWordCount} words | {inputText.length} characters
              </span>
            </div>
            <Textarea
              placeholder="Paste your text here to clean formatting artifacts..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          {/* Clean Button */}
          <div className="flex justify-center">
            <Button 
              onClick={handleClean}
              disabled={!inputText.trim()}
              className="px-8"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Clean Text
            </Button>
          </div>

          {/* Stats */}
          {showStats && stats && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Cleaning Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Characters Removed</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.charactersRemoved}</p>
                  </div>
                  <div>
                    <p className="font-medium">Invisible Chars</p>
                    <p className="text-2xl font-bold text-red-600">{stats.invisibleCharsRemoved}</p>
                  </div>
                  <div>
                    <p className="font-medium">Smart Quotes</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.smartQuotesConverted}</p>
                  </div>
                  <div>
                    <p className="font-medium">Spaces Fixed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.spacesNormalized}</p>
                  </div>
                  <div>
                    <p className="font-medium">Original Length</p>
                    <p className="text-lg font-semibold">{stats.originalLength}</p>
                  </div>
                  <div>
                    <p className="font-medium">Clean Length</p>
                    <p className="text-lg font-semibold">{stats.cleanedLength}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Output Text */}
          {outputText && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Clean Text</label>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500">
                    {outputWordCount} words | {outputText.length} characters
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
              <Textarea
                value={outputText}
                readOnly
                className="min-h-[200px] font-mono text-sm bg-gray-50"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}