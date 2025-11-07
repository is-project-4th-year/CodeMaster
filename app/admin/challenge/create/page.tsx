'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, Eye, Code, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { markdown } from '@codemirror/lang-markdown';
import { createExercise } from '@/actions/exercise';
import { CreateExerciseInput } from '@/types/exercise';


interface TestCase {
  input: string;
  expected_output: string;
  description: string;
  order_index: number;
  is_hidden: boolean;
}

const ExerciseAdminDashboard = () => {
  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'reference' | 'bug_fixes' | 'algorithms' | 'data_structures'>('reference');
  const [description, setDescription] = useState('');
  const [rank, setRank] = useState(8);
  const [rankName, setRankName] = useState('8 kyu');
  const [solutions, setSolutions] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      input: '',
      expected_output: '',
      description: '',
      order_index: 1,
      is_hidden: false
    }
  ]);

  // UI state
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Generate ID
  // No longer needed - database auto-generates ID

  // Handle rank change
  const handleRankChange = (value: string) => {
    const rankNum = parseInt(value);
    setRank(rankNum);
    setRankName(`${rankNum} kyu`);
  };

  // Tag management
  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Test case management
  const addTestCase = () => {
    setTestCases([
      ...testCases,
      {
        input: '',
        expected_output: '',
        description: '',
        order_index: testCases.length + 1,
        is_hidden: false
      }
    ]);
  };

  const removeTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const updateTestCase = (index: number, field: keyof TestCase, value: any) => {
    const updated = [...testCases];
    updated[index] = { ...updated[index], [field]: value };
    setTestCases(updated);
  };

  // Form validation
  const validateForm = (): string | null => {
    if (!name.trim()) return 'Exercise name is required';
    if (!description.trim()) return 'Description is required';
    if (!solutions.trim()) return 'Solution code is required';
    if (tags.length === 0) return 'At least one tag is required';
    if (testCases.length === 0) return 'At least one test case is required';
    
    for (const tc of testCases) {
      if (!tc.input.trim()) return 'All test cases must have input';
      if (!tc.expected_output.trim()) return 'All test cases must have expected output';
      if (!tc.description.trim()) return 'All test cases must have description';
    }
    
    return null;
  };

  // Submit handler
  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setSubmitStatus({ type: 'error', message: validationError });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const payload: CreateExerciseInput = {
        name,
        category,
        description,
        rank,
        rank_name: rankName,
        solutions,
        tags,
        test_cases: testCases
      };

      // Call the server action
      const result = await createExercise(payload);

      if (result.error) {
        setSubmitStatus({ type: 'error', message: result.error });
      } else {
        setSubmitStatus({ 
          type: 'success', 
          message: `Exercise "${result.data?.name}" created successfully with ID: ${result.data?.id}!` 
        });
        // Reset form after success
        setTimeout(() => {
          resetForm();
        }, 3000);
      }
    } catch (error) {
      console.error('Error creating exercise:', error);
      setSubmitStatus({ type: 'error', message: 'Unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setCategory('reference');
    setDescription('');
    setRank(8);
    setRankName('8 kyu');
    setSolutions('');
    setTags([]);
    setTestCases([{
      input: '',
      expected_output: '',
      description: '',
      order_index: 1,
      is_hidden: false
    }]);
    setSubmitStatus(null);
  };

  const categoryIcons = {
    reference: '📝',
    bug_fixes: '🐛',
    algorithms: '🧮',
    data_structures: '📊'
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create New Exercise</h1>
          <p className="text-muted-foreground mt-1">Add a new coding challenge to the platform</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)} className="gap-2">
            <Eye className="w-4 h-4" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Creating...' : 'Create Exercise'}
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {submitStatus && (
        <Alert className={submitStatus.type === 'success' ? 'border-success bg-success/10' : 'border-destructive bg-destructive/10'}>
          {submitStatus.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-success" />
          ) : (
            <AlertCircle className="w-4 h-4 text-destructive" />
          )}
          <AlertDescription className="ml-2">{submitStatus.message}</AlertDescription>
        </Alert>
      )}

      {/* Main Form */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="solution">Solution</TabsTrigger>
          <TabsTrigger value="tests">Test Cases</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Exercise Details</CardTitle>
              <CardDescription>Basic information about the exercise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
              <div>
                <Label htmlFor="name">Exercise Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rock Paper Scissors!"
                />
              </div>

              {/* Category and Rank */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={(val: any) => setCategory(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reference">📝 Reference</SelectItem>
                      <SelectItem value="bug_fixes">🐛 Bug Fixes</SelectItem>
                      <SelectItem value="algorithms">🧮 Algorithms</SelectItem>
                      <SelectItem value="data_structures">📊 Data Structures</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="rank">Difficulty Rank</Label>
                  <Select value={rank.toString()} onValueChange={handleRankChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8">8 kyu (Easiest)</SelectItem>
                      <SelectItem value="7">7 kyu</SelectItem>
                      <SelectItem value="6">6 kyu</SelectItem>
                      <SelectItem value="5">5 kyu</SelectItem>
                      <SelectItem value="4">4 kyu</SelectItem>
                      <SelectItem value="3">3 kyu</SelectItem>
                      <SelectItem value="2">2 kyu</SelectItem>
                      <SelectItem value="1">1 kyu (Hardest)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add a tag (e.g., Fundamentals)"
                  />
                  <Button onClick={addTag} variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-destructive"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Description Tab */}
        <TabsContent value="description">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Exercise Description
              </CardTitle>
              <CardDescription>Write the exercise description in Markdown format</CardDescription>
            </CardHeader>
            <CardContent>
              <CodeMirror
                value={description}
                height="500px"
                extensions={[markdown()]}
                onChange={(value) => setDescription(value)}
                theme="dark"
                placeholder="# Exercise Title&#10;&#10;Write your exercise description here..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Solution Tab */}
        <TabsContent value="solution">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Example Solution
              </CardTitle>
              <CardDescription>Provide a working solution in Python</CardDescription>
            </CardHeader>
            <CardContent>
              <CodeMirror
                value={solutions}
                height="500px"
                extensions={[python()]}
                onChange={(value) => setSolutions(value)}
                theme="dark"
                placeholder="def solution():&#10;    # Write your solution here&#10;    pass"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Cases Tab */}
        <TabsContent value="tests" className="space-y-4">
          {testCases.map((testCase, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Test Case {index + 1}</CardTitle>
                  {testCases.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTestCase(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Description</Label>
                  <Input
                    value={testCase.description}
                    onChange={(e) => updateTestCase(index, 'description', e.target.value)}
                    placeholder="Scissors beats paper"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Input</Label>
                    <Textarea
                      value={testCase.input}
                      onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                      placeholder='rps("scissors", "paper")'
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Expected Output</Label>
                    <Textarea
                      value={testCase.expected_output}
                      onChange={(e) => updateTestCase(index, 'expected_output', e.target.value)}
                      placeholder='"Player 1 won!"'
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`hidden-${index}`}
                    checked={testCase.is_hidden}
                    onChange={(e) => updateTestCase(index, 'is_hidden', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor={`hidden-${index}`} className="cursor-pointer">
                    Hidden test case (not shown to users)
                  </Label>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button onClick={addTestCase} variant="outline" className="w-full gap-2">
            <Plus className="w-4 h-4" />
            Add Test Case
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExerciseAdminDashboard;