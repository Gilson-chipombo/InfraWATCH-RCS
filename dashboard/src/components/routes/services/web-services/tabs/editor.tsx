'use client'

import React, { useEffect, useState } from 'react';
import CodeEditor from '../tools/code-editor';

const initialCode = {
    javascript: `// JavaScript Example
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log('Fibonacci sequence:');
for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}

const users = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
  { name: 'Charlie', age: 35 }
];

const adults = users
  .filter(user => user.age >= 18)
  .map(user => ({ ...user, isAdult: true }));

console.log(adults);`,

    python: `# Python Example
import math
from typing import List, Dict

def calculate_prime_numbers(limit: int) -> List[int]:
    if limit < 2:
        return []
    
    sieve = [True] * (limit + 1)
    sieve[0] = sieve[1] = False
    
    for i in range(2, int(math.sqrt(limit)) + 1):
        if sieve[i]:
            for j in range(i * i, limit + 1, i):
                sieve[j] = False
    
    return [i for i in range(2, limit + 1) if sieve[i]]

class DataProcessor:
    def __init__(self, data: List[Dict]):
        self.data = data
    
    def filter_by_age(self, min_age: int) -> List[Dict]:
        return [item for item in self.data if item.get('age', 0) >= min_age]
    
    def get_statistics(self) -> Dict:
        ages = [item.get('age', 0) for item in self.data]
        return {
            'count': len(ages),
            'average': sum(ages) / len(ages) if ages else 0,
            'min': min(ages) if ages else 0,
            'max': max(ages) if ages else 0
        }

primes = calculate_prime_numbers(50)
print(f"Prime numbers up to 50: {primes}")

data = [
    {'name': 'Alice', 'age': 30},
    {'name': 'Bob', 'age': 25},
    {'name': 'Charlie', 'age': 35}
]

processor = DataProcessor(data)
adults = processor.filter_by_age(18)
stats = processor.get_statistics()
print(f"Statistics: {stats}")`,

    bash: `#!/bin/bash
# Bash Script Example

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

get_system_info() {
    log "Gathering system information..."
    echo "Hostname: $(hostname)"
    echo "OS: $(uname -s)"
    echo "Kernel: $(uname -r)"
    echo "Architecture: $(uname -m)"
    echo "Uptime: $(uptime -p 2>/dev/null || uptime)"
    echo "Current User: $(whoami)"
    echo "Current Directory: $(pwd)"
}

check_disk_usage() {
    log "Checking disk usage..."
    df -h | head -n 1
    df -h | grep -E '^/dev/' | sort
}

check_memory() {
    log "Checking memory usage..."
    if command_exists free; then
        free -h
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        vm_stat | head -n 10
    fi
}

list_processes() {
    log "Listing top processes..."
    ps aux | head -n 11
}

check_network() {
    log "Checking network connectivity..."
    if command_exists ping; then
        if ping -c 1 google.com >/dev/null 2>&1; then
            echo "✓ Internet connectivity: OK"
        else
            echo "✗ Internet connectivity: FAILED"
        fi
    fi
    if command_exists netstat; then
        netstat -tuln | head -n 10
    fi
}

main() {
    log "Starting system check script..."
    get_system_info
    check_disk_usage
    check_memory
    list_processes
    check_network
    log "System check completed!"
}

main "$@"`,
} as any

export default function Editor() {
    const [language, setLanguage] = useState("javascript")
    const [code, setCode] = useState<any>(null);

    const handleLanguageChange = (e: any) => {
        const newLang = e.target.value
        setLanguage(newLang)
        setCode(initialCode[newLang])
    }

    useEffect(() => {
        setCode(initialCode[language])
    }, [])

    const languageInfo = {
        javascript: { label: "JavaScript", color: "bg-yellow-500" },
        python: { label: "Python", color: "bg-blue-500" },
        bash: { label: "Bash", color: "bg-green-500" },
    } as any

    return (
        <div className="min-h-screen bg-[#282a36] p-4">
            <div className="max-w-6xl mx-auto space-y-4">
                <div className="bg-[#44475a] border border-[#6272a4] rounded-lg">
                    <div className="flex items-center justify-between p-4 border-b border-[#6272a4]">
                        <h2 className="text-[#f8f8f2] flex items-center gap-2 text-lg font-semibold">
                            CodeMirror Editor - Dracula Theme
                            <span className={`text-xs px-2 py-0.5 rounded ${languageInfo[language].color}`}>
                                {languageInfo[language].label}
                            </span>
                        </h2>
                        <select
                            value={language}
                            onChange={handleLanguageChange}
                            className="bg-[#282a36] border border-[#6272a4] text-[#f8f8f2] rounded px-2 py-1"
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="bash">Bash</option>
                        </select>
                    </div>
                    <div className="p-0">
                        <CodeEditor value={code} onChange={setCode} language={language} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#44475a] border border-[#6272a4] rounded-lg p-4">
                        <h3 className="text-[#f8f8f2] text-sm font-semibold mb-2">Features</h3>
                        <ul className="text-[#f8f8f2] text-sm space-y-1 list-disc list-inside">
                            <li>Syntax highlighting</li>
                            <li>Line numbers</li>
                            <li>Code folding</li>
                            <li>Auto-completion</li>
                            <li>Bracket matching</li>
                        </ul>
                    </div>

                    <div className="bg-[#44475a] border border-[#6272a4] rounded-lg p-4">
                        <h3 className="text-[#f8f8f2] text-sm font-semibold mb-2">Shortcuts</h3>
                        <ul className="text-[#f8f8f2] text-sm space-y-1 list-disc list-inside">
                            <li>Ctrl+/ - Toggle comment</li>
                            <li>Ctrl+D - Select next occurrence</li>
                            <li>Ctrl+F - Find</li>
                            <li>Ctrl+H - Replace</li>
                            <li>Tab - Indent</li>
                        </ul>
                    </div>

                    <div className="bg-[#44475a] border border-[#6272a4] rounded-lg p-4">
                        <h3 className="text-[#f8f8f2] text-sm font-semibold mb-2">Languages</h3>
                        <ul className="text-[#f8f8f2] text-sm space-y-1 list-disc list-inside">
                            <li>JavaScript/TypeScript</li>
                            <li>Python</li>
                            <li>Bash/Shell</li>
                            <li>Full syntax support</li>
                            <li>Language-specific features</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
