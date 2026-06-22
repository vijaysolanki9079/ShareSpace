'use client';

import React from 'react';
import { Calendar, CheckCircle2, Clock, MapPin, Package, X } from 'lucide-react';
import Link from 'next/link';

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
  const buttonHref = mode === 'ngo' ? '/requests' : '/donations';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-2xl font-semibold tracking-tight text-transparent sm:text-3xl">
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
        </div>
        <Link
          href={buttonHref}
          className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 sm:w-auto"
        >
          {buttonLabel}
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[300px] rounded-xl bg-white/5 animate-pulse border border-white/10" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(donations as DonationItem[]).map((item) => (
            <article
              key={item.id}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/55 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-emerald-400/30 hover:shadow-lg hover:shadow-emerald-500/10"
            >
              <div className="relative aspect-[2/1] overflow-hidden bg-slate-800">
                {item.img ? (
                  <img
                    src={item.img}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <NoImageFallback />
                )}
                <div className="pointer-events-none absolute inset-0 bg-slate-950/40 transition-opacity duration-500 group-hover:bg-slate-950/20" />
                <div className="absolute right-3 top-3">
                  <div
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      item.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {item.status === 'completed' ? (
                      <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    ) : (
                      <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
                    )}
                    {item.status === 'completed' ? 'Completed' : 'Pending'}
                  </div>
                </div>
                <span className="absolute bottom-3 left-3 z-10 rounded-lg bg-zinc-950/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-200 backdrop-blur-md">
                  {item.category}
                </span>
                <div className="absolute left-3 top-3 flex max-w-[calc(100%-7rem)] items-center gap-1 rounded-full border border-white/20 bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur-sm">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600" strokeWidth={1.75} />
                  <span className="truncate">{item.location}</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-slate-100 transition-colors group-hover:text-emerald-400">
                  {item.title}
                </h3>
                <p className="mt-1.5 flex items-center gap-2 text-[13px] text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {new Date(item.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>

                <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
                  <div className="flex items-center gap-2 text-[13px] text-zinc-400">
                    <Package className="h-3.5 w-3.5" />
                    <span className="line-clamp-1 font-medium text-slate-200">{item.description || 'Donation offer recorded'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    Request is <span className="font-medium capitalize text-slate-300">{item.requestStatus}</span>
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedDonation(item)}
                    className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-emerald-500/20 px-4 text-center text-[13px] font-semibold text-emerald-300 ring-1 ring-emerald-500/30 transition-colors hover:bg-emerald-500/30"
                  >
                    {mode === 'ngo' ? 'Review allocation' : 'View details'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {!isLoading && donations.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.04] px-4 py-14 text-center">
          <Package className="mx-auto mb-4 h-14 w-14 text-zinc-300" />
          <h3 className="text-lg font-semibold text-slate-100">No donations found</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-300">
            Start with a community request or browse donation opportunities nearby.
          </p>
          <Link
            href={buttonHref}
            className="mt-6 inline-flex rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            {buttonLabel}
          </Link>
        </div>
      )}

      {selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <button
            type="button"
            aria-label="Close donation details"
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setSelectedDonation(null)}
          />

          <div className="relative grid max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl overflow-hidden rounded-3xl border border-emerald-400/15 bg-zinc-950 shadow-2xl shadow-emerald-950/30 md:max-h-[82vh] md:grid-cols-[0.9fr_1.1fr]">
            <div className="relative min-h-[220px] bg-slate-900 sm:min-h-[260px]">
              {selectedDonation.img ? (
                <img
                  src={selectedDonation.img}
                  alt={selectedDonation.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full min-h-[260px] place-items-center bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950">
                  <Package className="h-20 w-20 text-emerald-300/70" strokeWidth={1.5} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <span className="absolute left-5 top-5 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
                {selectedDonation.category}
              </span>
            </div>

            <div className="min-h-0 overflow-y-auto p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-300">
                    Donation details
                  </p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
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
