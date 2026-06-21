'use client';

import React from 'react';
import { Calendar, CheckCircle2, Clock, MapPin, Package, X } from 'lucide-react';

interface MyDonationsProps {
  mode?: 'user' | 'ngo';
}

import { useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc';
import NoImageFallback from '../NoImageFallback';

type DonationItem = {
  id: string;
  requestId: string;
  img: string | null;
  category: string;
  title: string;
  description: string;
  status: string;
  requestStatus: string;
  location: string;
  date: string;
};

const MyDonations = ({ mode = 'user' }: MyDonationsProps) => {
  const { data: session } = useSession();
  const userId = session?.user?.id as string;
  const [selectedDonation, setSelectedDonation] = React.useState<DonationItem | null>(null);
  
  const { data: fetchedDonations, isLoading } = trpc.item.getMyDonations.useQuery(
    { userId },
    { enabled: !!userId && mode === 'user' }
  );

  const donations = fetchedDonations || [];
  const title = mode === 'ngo' ? 'Received donations' : 'My donations';
  const subtitle =
    mode === 'ngo'
      ? 'Donations currently assigned to your organization'
      : 'Items you have shared with your community';
  const buttonLabel = mode === 'ngo' ? '+ Review queue' : '+ New donation';

  return (
    <div className="space-y-8 pt-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="bg-gradient-to-r from-sky-300 via-cyan-300 to-emerald-300 bg-clip-text text-2xl font-semibold tracking-tight text-transparent sm:text-3xl">
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-4 py-2 text-[13px] font-semibold text-slate-950 transition-colors hover:bg-sky-400"
        >
          {buttonLabel}
        </button>
      </div>

      {isLoading ? (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[200px] rounded-xl bg-white/5 animate-pulse border border-white/10" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(donations as DonationItem[]).map((item) => (
            <article
              key={item.id}
              className="group overflow-hidden rounded-xl border border-sky-400/10 bg-slate-900/35 backdrop-blur-md transition-all duration-300 hover:border-sky-300/25 hover:bg-slate-900/55"
            >
              <div className="relative aspect-[2/1] overflow-hidden bg-slate-800">
                {item.img ? (
                  <img
                    src={item.img}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <NoImageFallback />
                )}
                <div className="pointer-events-none absolute inset-0 bg-slate-950/40 transition-opacity duration-500 group-hover:bg-slate-950/20" />
                <span className="absolute left-3 top-3 z-10 rounded-full border border-white/10 bg-slate-950/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-200 backdrop-blur-md">
                  {item.category}
                </span>
              </div>
              <div className="p-3">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100">{item.title}</h3>
                    <p className="mt-1 text-[13px] text-slate-400">{item.date}</p>
                  </div>
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-all ${
                      item.status === 'completed'
                        ? 'border-sky-400/30 bg-sky-400/10 text-sky-300'
                        : 'border-violet-400/30 bg-violet-400/10 text-violet-300'
                    }`}
                    title={item.status}
                  >
                    {item.status === 'completed' ? (
                      <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
                    ) : (
                      <Clock className="h-4 w-4" strokeWidth={1.75} />
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDonation(item)}
                  className="w-full rounded-lg bg-sky-400/10 py-1.5 text-[13px] font-semibold text-sky-300 ring-1 ring-sky-400/15 transition-colors hover:bg-sky-400/15"
                >
                  {mode === 'ngo' ? 'Review allocation' : 'View details'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pb-6 pt-24 md:pt-28">
          <button
            type="button"
            aria-label="Close donation details"
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
            onClick={() => setSelectedDonation(null)}
          />

          <div className="relative grid max-h-[82vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl md:grid-cols-[0.9fr_1.1fr]">
            <div className="relative min-h-[260px] bg-slate-900">
              {selectedDonation.img ? (
                <img
                  src={selectedDonation.img}
                  alt={selectedDonation.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full min-h-[320px] place-items-center bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950">
                  <Package className="h-20 w-20 text-emerald-300/70" strokeWidth={1.5} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <span className="absolute left-5 top-5 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
                {selectedDonation.category}
              </span>
            </div>

            <div className="min-h-0 overflow-y-auto p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-300">
                    Donation details
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                    {selectedDonation.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDonation(null)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <DetailTile
                  icon={<Clock className="h-4 w-4" />}
                  label="Offer status"
                  value={selectedDonation.status === 'completed' ? 'Completed' : 'Pending'}
                  tone={selectedDonation.status === 'completed' ? 'emerald' : 'amber'}
                />
                <DetailTile
                  icon={<Calendar className="h-4 w-4" />}
                  label="Offered on"
                  value={new Date(selectedDonation.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                />
                <DetailTile
                  icon={<MapPin className="h-4 w-4" />}
                  label="Request area"
                  value={selectedDonation.location}
                />
              </div>

              <div className="mt-5 rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-4">
                <p className="text-sm font-semibold text-emerald-100">Request note</p>
                <p className="mt-2 text-sm leading-6 text-emerald-50/75">
                  {selectedDonation.description || 'No extra description was added for this request.'}
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm font-semibold text-white">Tracking</p>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Request status</p>
                    <p className="mt-1 text-sm font-medium capitalize text-slate-200">{selectedDonation.requestStatus}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Request ID</p>
                    <p className="mt-1 truncate text-sm font-medium text-slate-200">{selectedDonation.requestId}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <a
                  href={`/requests/${selectedDonation.requestId}`}
                  className="inline-flex flex-1 items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
                >
                  Open request page
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedDonation(null)}
                  className="inline-flex flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10"
                >
                  Close details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDonations;

function DetailTile({
  icon,
  label,
  value,
  tone = 'slate',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: 'slate' | 'emerald' | 'amber';
}) {
  const toneClass =
    tone === 'emerald'
      ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
      : tone === 'amber'
        ? 'border-amber-400/20 bg-amber-400/10 text-amber-200'
        : 'border-white/10 bg-white/[0.04] text-slate-200';

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <div className="flex items-center gap-2 text-current">
        {icon}
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</p>
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-semibold">{value}</p>
    </div>
  );
}
