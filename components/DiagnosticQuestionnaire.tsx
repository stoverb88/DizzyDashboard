import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { AlertTriangle, CheckSquare, BrainCircuit } from 'lucide-react';

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
    {children}
  </h3>
);

const Question = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-start gap-2 mb-2">
        <CheckSquare className="h-5 w-5 text-gray-500 mt-1 flex-shrink-0" />
        <p className="text-gray-700">{children}</p>
    </div>
);

const ReferralNote = ({ children }: { children: React.ReactNode }) => (
    <div className="mt-2 p-2 bg-red-50 border-l-4 border-red-500 text-red-800 text-sm rounded-r-lg">
        <strong>➡️ {children}</strong>
    </div>
);

const Consideration = ({ category, items }: { category: string, items: string[] }) => (
    <div className="mt-3">
        <p className="font-semibold text-gray-700 mb-2">➡️ Consider:</p>
        <div className="pl-4 border-l-2 border-gray-300">
            <p className="text-gray-600">
                <span className="font-bold">{category} &rarr;</span> {items.join(' / ')}
            </p>
        </div>
    </div>
);

export default function DiagnosticQuestionnaire() {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <BrainCircuit className="h-6 w-6 text-indigo-600" />
          <h2 className="font-bold text-2xl text-gray-900">Vestibular Screening & Diagnostic Questionnaire</h2>
        </div>

        <div className="space-y-8">
          {/* Section 1 */}
          <div>
            <SectionTitle>
              <Badge className="bg-red-500 text-white">1</Badge>
              Initial Triage – Screen for Urgent Red Flags
            </SectionTitle>
            <p className="mb-3 text-gray-600 font-medium">Are you currently experiencing any of the following?</p>
            <div className="space-y-1 pl-4">
                <Question>Loss of consciousness or confusion</Question>
                <Question>Chest pain</Question>
                <Question>Severe or thunderclap headache</Question>
                <Question>Neck pain</Question>
                <Question>Shortness of breath (dyspnea)</Question>
                <Question>High fever</Question>
                <Question>Sudden weakness, facial droop, difficulty speaking, double vision, or loss of coordination (neurological signs – "5 Ds")</Question>
            </div>
            <ReferralNote>If YES to any, refer to emergency care.</ReferralNote>
          </div>

          {/* Section 2 */}
          <div>
            <SectionTitle>
              <Badge className="bg-blue-500 text-white">2</Badge>
              Syndromic Classification (Timing, Triggers, Duration)
            </SectionTitle>
            
            <div className="space-y-6">
                {/* Acute */}
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">🧠 ACUTE VESTIBULAR SYNDROME (AVS)</h4>
                    <p className="text-sm text-blue-700 mb-3 italic">(Continuous dizziness/vertigo lasting days)</p>
                    <Question>Were your symptoms spontaneous or provoked (head trauma, medication, toxins)?</Question>
                    <Question>Do you currently have any of the 5 Ds (Diplopia, Dysarthria, Dysphagia, Drop attacks, Dysmetria/ataxia)?</Question>
                    <ReferralNote>If YES to 5Ds, consider central causes (stroke, Wernicke's, MS) &rarr; Perform HINTS+ exam.</ReferralNote>
                </div>

                {/* Recurrent */}
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-2">🔁 RECURRENT VESTIBULAR SYNDROME (RVS)</h4>
                     <p className="text-sm text-purple-700 mb-3 italic">(Repeated episodes with full recovery between attacks)</p>
                     <p className='font-medium text-gray-700 mb-2'>Are your episodes paroxysmal (brief, sudden, with full recovery)?</p>
                    <Consideration category="Positional" items={["BPPV (Dix-Hallpike, Roll test)"]} />
                    <Consideration category="Orthostatic" items={["Blood pressure-related dizziness"]} />
                    <Consideration category="Valsalva/Tullio" items={["Third window syndrome"]} />
                    <p className='font-medium text-gray-700 mt-4 mb-2'>If Non-Paroxysmal, do you experience:</p>
                    <Consideration category="Hearing symptoms" items={["Ménière's disease"]} />
                    <Consideration category="Migraine history" items={["Vestibular migraine"]} />
                    <Consideration category="Panic/space/motion" items={["Psychogenic dizziness (e.g., PPPD)"]} />
                </div>

                {/* Chronic */}
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">🧍‍♂️ CHRONIC VESTIBULAR SYNDROME (CVS)</h4>
                    <p className="text-sm text-green-700 mb-3 italic">(Continuous symptoms for weeks/months)</p>
                    <Question>Have symptoms persisted daily for over 3 months?</Question>
                    <Question>Do you have visual blurring or imbalance while walking?</Question>
                    <Question>Do you have bilateral or unilateral vestibular loss (test VOR)?</Question>
                    <Question>History of exposure to ototoxic drugs?</Question>
                    <ReferralNote>Consider CANVAS, SCAs, Friedreich's, MSA, Vestibular schwannoma, labyrinthitis, PPPD, orthostatic tremor, myelopathy, or Parkinsonism based on findings.</ReferralNote>
                </div>
            </div>
          </div>

           {/* Summary Output */}
           <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-bold text-lg text-gray-800 mb-3">✅ Summary Output</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                        <label htmlFor="avs-cause" className="font-semibold text-gray-700 w-32">AVS likely cause:</label>
                        <input type="text" id="avs-cause" className="border-gray-300 rounded-md shadow-sm w-full p-1" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="rvs-cause" className="font-semibold text-gray-700 w-32">RVS likely cause:</label>
                        <input type="text" id="rvs-cause" className="border-gray-300 rounded-md shadow-sm w-full p-1" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="cvs-cause" className="font-semibold text-gray-700 w-32">CVS likely cause:</label>
                        <input type="text" id="cvs-cause" className="border-gray-300 rounded-md shadow-sm w-full p-1" />
                    </div>
                     <div className="flex items-center gap-2">
                        <label className="font-semibold text-gray-700 w-32">Referral indicated:</label>
                        <div className="flex gap-4">
                           <label><input type="checkbox" className="mr-1"/>Neurology</label>
                           <label><input type="checkbox" className="mr-1"/>ENT</label>
                           <label><input type="checkbox" className="mr-1"/>Cardiology</label>
                           <label><input type="checkbox" className="mr-1"/>ER</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
} 