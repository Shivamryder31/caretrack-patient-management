import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Cloud, 
  ShieldAlert, 
  FileCheck, 
  Copy, 
  Check, 
  Server,
  BookOpen
} from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'run' | 'deploy' | 'rules'>('run');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-700" />
            <div>
              <h2 className="text-base font-bold text-slate-900">CareTrack — System Guide & Deployment Manual</h2>
              <p className="text-xs text-slate-500">Local developer execution and cloud deployment instructions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="px-5 pt-1">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('run')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'run' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Run Locally (Dev)
            </button>
            <button
              onClick={() => setActiveTab('deploy')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'deploy' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. Deploy Online (Cloud)
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'rules' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3. Clinical Rules Reference
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-5 text-xs space-y-4 text-slate-700">
          {activeTab === 'run' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-teal-700" />
                <span>Running CareTrack Locally on Node.js</span>
              </h3>

              <p className="text-xs leading-relaxed text-slate-600">
                CareTrack is built with React 19, TypeScript, and Vite. Follow these steps to clone and run the application on your computer:
              </p>

              {/* Step 1 */}
              <div className="space-y-1.5">
                <div className="font-semibold text-slate-800">Step 1: Install Dependencies</div>
                <div className="relative bg-slate-900 text-slate-100 p-3 rounded font-mono text-xs flex justify-between items-center">
                  <code>npm install</code>
                  <button
                    onClick={() => copyToClipboard('npm install')}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedText === 'npm install' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-1.5">
                <div className="font-semibold text-slate-800">Step 2: Start Development Server</div>
                <div className="relative bg-slate-900 text-slate-100 p-3 rounded font-mono text-xs flex justify-between items-center">
                  <code>npm run dev</code>
                  <button
                    onClick={() => copyToClipboard('npm run dev')}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedText === 'npm run dev' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-2xs text-slate-500">Open <strong className="text-slate-700">http://localhost:3000</strong> in your web browser.</p>
              </div>

              {/* Step 3 */}
              <div className="space-y-1.5">
                <div className="font-semibold text-slate-800">Step 3: Build for Production</div>
                <div className="relative bg-slate-900 text-slate-100 p-3 rounded font-mono text-xs flex justify-between items-center">
                  <code>npm run build</code>
                  <button
                    onClick={() => copyToClipboard('npm run build')}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedText === 'npm run build' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-2xs text-slate-500">Outputs production assets to the <code className="bg-slate-100 px-1 py-0.5 rounded">/dist</code> directory.</p>
              </div>
            </div>
          )}

          {activeTab === 'deploy' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Cloud className="w-4 h-4 text-sky-700" />
                <span>Deploying Online (Hosting Options)</span>
              </h3>

              {/* Option A: Vercel / Netlify */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="font-semibold text-slate-900 text-xs">Option A: Vercel or Netlify (Fastest Free Web Hosting)</div>
                <ol className="list-decimal list-inside space-y-1 text-2xs text-slate-600">
                  <li>Push your repository to GitHub or GitLab.</li>
                  <li>Log in to <strong className="text-slate-800">Vercel.com</strong> or <strong className="text-slate-800">Netlify.com</strong>.</li>
                  <li>Click <em>"Add New Project"</em> and select your repository.</li>
                  <li>Build Command: <code className="bg-white px-1 border rounded">npm run build</code></li>
                  <li>Output Directory: <code className="bg-white px-1 border rounded">dist</code></li>
                  <li>Click <em>"Deploy"</em>. Your application will be live at a custom URL in seconds.</li>
                </ol>
              </div>

              {/* Option B: Google Cloud Run */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="font-semibold text-slate-900 text-xs">Option B: Google Cloud Run / Containerized Hosting</div>
                <p className="text-2xs text-slate-600">
                  You can deploy this applet directly using the Google Cloud CLI:
                </p>
                <div className="relative bg-slate-900 text-slate-100 p-2.5 rounded font-mono text-2xs">
                  <code>gcloud run deploy caretrack --source . --port 3000 --allow-unauthenticated</code>
                </div>
              </div>

              {/* Option C: Docker Container */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="font-semibold text-slate-900 text-xs">Option C: Docker Containerization</div>
                <div className="bg-slate-900 text-slate-100 p-2.5 rounded font-mono text-2xs overflow-x-auto">
                  <pre>{`FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`}</pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-3.5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-teal-700" />
                <span>CareTrack Clinical Rules Enforcement</span>
              </h3>

              <div className="space-y-2.5">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <div className="font-semibold text-slate-800">1. Strict 74-Bed Capacity Limit</div>
                  <p className="text-2xs text-slate-600 mt-0.5">
                    The facility has a hard maximum ceiling of 74 isolation beds (Ward A: 24, Ward B: 26, Ward C: 24). New patient admissions are blocked once occupied beds reach 74.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <div className="font-semibold text-slate-800">2. Discharge Eligibility Criteria (3 Consecutive Days Afebrile)</div>
                  <p className="text-2xs text-slate-600 mt-0.5">
                    A patient qualifies as <em>Eligible for Discharge</em> only after completing <strong>three complete consecutive days without fever (&lt; 38.0°C)</strong> based on logged observations. Any spike &ge; 38.0°C instantly resets the consecutive day streak to zero.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <div className="font-semibold text-slate-800">3. Separation of Eligibility vs. Administrative Approval</div>
                  <p className="text-2xs text-slate-600 mt-0.5">
                    Eligibility is strictly clinical and observational. Administrative discharge approval requires an explicit Medical Director sign-off, post-discharge quarantine guidance, and formal bed release.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <div className="font-semibold text-slate-800">4. Prevention of Duplicate Observations</div>
                  <p className="text-2xs text-slate-600 mt-0.5">
                    The Nurse Station validates against multiple readings logged for the same patient on the same day. Overriding an existing observation requires explicit clinical authorization and documentation of the reason.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <div className="font-semibold text-slate-800">5. Case Fatality Rate &gt; 15% Warning</div>
                  <p className="text-2xs text-slate-600 mt-0.5">
                    Mortality is calculated using the standard formula <code className="bg-white px-1 border rounded">[Deaths ÷ (Deaths + Recoveries)] × 100</code>. If this exceeds 15.0%, an urgent clinical oversight warning is displayed across the reports.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-2xs text-slate-500">
            CareTrack Demonstration Environment — Fictional Medical Records
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
