'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { runAllTests, TestResult } from '@/lib/testSuite';

export default function TestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);

  const runTests = () => {
    setRunning(true);
    setTimeout(() => {
      const r = runAllTests();
      setResults(r);
      setRunning(false);
    }, 100);
  };

  useEffect(() => {
    runTests();
  }, []);

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  return (
    <div className="min-h-screen bg-stadium-darker p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black">Test Suite</h1>
          <Link href="/" className="text-sm text-stadium-green hover:underline">
            ← Back to Game
          </Link>
        </div>

        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-2xl font-black">
                <span className="text-stadium-green">{passed}</span>
                <span className="text-gray-500"> / {results.length}</span>
              </p>
              <p className="text-sm text-gray-400">tests passed</p>
            </div>
            {failed > 0 && (
              <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-bold">
                {failed} FAILED
              </span>
            )}
            {results.length > 0 && failed === 0 && (
              <span className="px-3 py-1 bg-stadium-green/20 text-stadium-green rounded-full text-sm font-bold">
                ALL PASS
              </span>
            )}
            <button onClick={runTests} disabled={running} className="btn-primary">
              {running ? 'Running...' : 'Re-run Tests'}
            </button>
          </div>
        </GlassCard>

        <div className="space-y-2">
          {results.map((test) => (
            <div
              key={test.name}
              className={`glass p-4 rounded-xl flex items-center justify-between ${
                test.passed ? 'border-l-4 border-stadium-green' : 'border-l-4 border-red-500'
              }`}
            >
              <div>
                <p className="font-medium">{test.name}</p>
                {!test.passed && <p className="text-xs text-red-400 mt-1">{test.message}</p>}
              </div>
              <div className="text-right">
                <span
                  className={`font-bold text-sm ${
                    test.passed ? 'text-stadium-green' : 'text-red-400'
                  }`}
                >
                  {test.passed ? 'PASS' : 'FAIL'}
                </span>
                <p className="text-xs text-gray-500">{test.duration.toFixed(1)}ms</p>
              </div>
            </div>
          ))}
        </div>

        {running && (
          <p className="text-center text-gray-400 animate-pulse">Running tests...</p>
        )}
      </div>
    </div>
  );
}
