import React, { useState } from 'react'
import Markdown from 'react-markdown'
import { Award, CheckCircle2, AlertCircle } from 'lucide-react'

const CreationItem = ({ item }) => {
  const [expanded, setExpanded] = useState(false)

  // Try parsing JSON if resume review
  let parsedResume = null
  if (item.type === 'resume-review') {
    try {
      parsedResume = JSON.parse(item.content)
    } catch {
      parsedResume = null
    }
  }

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className='p-4 max-w-5xl text-sm bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition'
    >
      <div className='flex justify-between items-center gap-4'>
        <div>
          <h2 className='font-semibold text-slate-800'>{item.prompt}</h2>
          <p className='text-gray-500 text-xs mt-0.5'>
            {item.type} • {new Date(item.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className='flex items-center gap-2'>
          {parsedResume?.overallScore !== undefined && (
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full ${
                parsedResume.overallScore >= 80
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : parsedResume.overallScore >= 60
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              ATS Score: {parsedResume.overallScore}/100
            </span>
          )}
          <button className='bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] px-3.5 py-1 rounded-full text-xs font-medium'>
            {item.type}
          </button>
        </div>
      </div>

      {expanded && (
        <div className='mt-3 pt-3 border-t border-gray-100'>
          {item.type === 'image' ? (
            <div>
              <img
                src={item.content}
                alt='image'
                className='w-full max-w-md rounded-lg'
              />
            </div>
          ) : parsedResume ? (
            <div className='space-y-4 text-slate-700'>
              {/* Summary */}
              {parsedResume.summary && (
                <p className='text-xs md:text-sm text-gray-600 bg-slate-50 p-3 rounded-lg border border-gray-100'>
                  {parsedResume.summary}
                </p>
              )}

              {/* Category Scores */}
              {parsedResume.categories && (
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
                  {parsedResume.categories.map((cat) => (
                    <div
                      key={cat.id}
                      className='p-2.5 bg-gray-50/70 border border-gray-100 rounded-lg flex items-center justify-between'
                    >
                      <span className='text-xs font-semibold uppercase text-slate-700'>
                        {cat.name}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          cat.score >= 80
                            ? 'bg-emerald-100 text-emerald-800'
                            : cat.score >= 60
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {cat.score}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Top Fixes */}
              {parsedResume.topFixes && parsedResume.topFixes.length > 0 && (
                <div className='text-xs space-y-1'>
                  <span className='font-bold text-slate-800 block'>
                    Priority Action Items:
                  </span>
                  <ul className='list-disc pl-4 space-y-1 text-slate-600'>
                    {parsedResume.topFixes.map((fix, idx) => (
                      <li key={idx}>{fix}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className='max-h-96 overflow-y-auto text-sm text-slate-700'>
              <div className='reset-tw'>
                <Markdown>{item.content}</Markdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CreationItem
