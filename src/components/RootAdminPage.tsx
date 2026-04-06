import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Crown,
  DollarSign,
  Search,
  ShieldCheck,
  Store,
  UserCog,
  Wallet,
  XCircle
} from 'lucide-react';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';
import type { PageType, SessionUser } from '../App';

interface RootAdminPageProps {
  navigate: (page: PageType) => void;
  currentUser: SessionUser;
  onLogout: () => void;
}

type StoreRecord = {
  id: number;
  store: string;
  owner: string;
  region: string;
  plan: string;
  mrr: number;
  payout: 'On Track' | 'Reviewing' | 'Held';
  status: 'Live' | 'Suspended';
  verification: 'Verified' | 'Pending';
  domain: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  lastReview: string;
};

type ApprovalItem = {
  id: number;
  label: string;
  subject: string;
  detail: string;
  priority: 'High' | 'Medium';
  status: 'Pending' | 'Approved' | 'Rejected';
};

type ActivityEntry = {
  id: number;
  message: string;
  time: string;
};

const initialStores: StoreRecord[] = [
  {
    id: 1,
    store: 'Lake View Electronics',
    owner: 'Ochieng Otieno',
    region: 'Kisumu',
    plan: 'Scale',
    mrr: 48000,
    payout: 'On Track',
    status: 'Live',
    verification: 'Verified',
    domain: 'lakeview.fezzy.shop',
    riskLevel: 'Low',
    lastReview: '04 Apr 2026'
  },
  {
    id: 2,
    store: 'Amina Beauty House',
    owner: 'Amina Yusuf',
    region: 'Nairobi',
    plan: 'Starter',
    mrr: 12000,
    payout: 'Reviewing',
    status: 'Live',
    verification: 'Pending',
    domain: 'aminabeauty.fezzy.shop',
    riskLevel: 'Medium',
    lastReview: '05 Apr 2026'
  },
  {
    id: 3,
    store: 'Nairobi Sneakers',
    owner: 'Kevin Mwangi',
    region: 'Nairobi',
    plan: 'Growth',
    mrr: 26000,
    payout: 'Held',
    status: 'Suspended',
    verification: 'Pending',
    domain: 'nairobisneakers.fezzy.shop',
    riskLevel: 'High',
    lastReview: '06 Apr 2026'
  },
  {
    id: 4,
    store: 'Organic Honey KE',
    owner: 'Sarah Kendi',
    region: 'Nakuru',
    plan: 'Growth',
    mrr: 31000,
    payout: 'On Track',
    status: 'Live',
    verification: 'Verified',
    domain: 'organichoneyke.fezzy.shop',
    riskLevel: 'Low',
    lastReview: '03 Apr 2026'
  }
];

const initialApprovals: ApprovalItem[] = [
  {
    id: 1,
    label: 'Store ownership transfer',
    subject: 'Mama Mboga Market',
    detail: 'Requested after a business registration change.',
    priority: 'High',
    status: 'Pending'
  },
  {
    id: 2,
    label: 'Manual payout release',
    subject: 'Nairobi Sneakers',
    detail: 'Held after KYC mismatch and refund spike.',
    priority: 'High',
    status: 'Pending'
  },
  {
    id: 3,
    label: 'Plan override approval',
    subject: 'Amina Beauty House',
    detail: 'Temporary upgrade requested for a campaign traffic surge.',
    priority: 'Medium',
    status: 'Pending'
  }
];

const initialActivity: ActivityEntry[] = [
  {
    id: 1,
    message: 'Root Admin opened the owner console and synced the latest store controls.',
    time: 'Just now'
  },
  {
    id: 2,
    message: 'Compliance flagged Nairobi Sneakers for payout hold review.',
    time: '18 min ago'
  },
  {
    id: 3,
    message: 'Operations approved a plan review for Amina Beauty House.',
    time: '47 min ago'
  }
];

export function RootAdminPage({
  navigate,
  currentUser,
  onLogout
}: RootAdminPageProps) {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('All Regions');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [isLoading, setIsLoading] = useState(true);
  const [stores, setStores] = useState<StoreRecord[]>(initialStores);
  const [approvals, setApprovals] = useState<ApprovalItem[]>(initialApprovals);
  const [activity, setActivity] = useState<ActivityEntry[]>(initialActivity);
  const [selectedStoreId, setSelectedStoreId] = useState(initialStores[0].id);
  const [banner, setBanner] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 950);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!banner) {
      return undefined;
    }

    const timer = window.setTimeout(() => setBanner(''), 2400);
    return () => window.clearTimeout(timer);
  }, [banner]);

  const regions = useMemo(
    () => ['All Regions', ...Array.from(new Set(stores.map((store) => store.region)))],
    [stores]
  );

  const filteredStores = useMemo(
    () =>
      stores.filter((store) => {
        const matchesSearch =
          `${store.store} ${store.owner} ${store.region} ${store.status} ${store.domain}`.
            toLowerCase().
            includes(search.toLowerCase());
        const matchesRegion =
          regionFilter === 'All Regions' || store.region === regionFilter;
        const matchesStatus =
          statusFilter === 'All Statuses' || store.status === statusFilter;

        return matchesSearch && matchesRegion && matchesStatus;
      }),
    [regionFilter, search, statusFilter, stores]
  );

  const selectedStore =
    stores.find((store) => store.id === selectedStoreId) || filteredStores[0] || stores[0];

  const metrics = useMemo(() => {
    const managedCount = stores.length;
    const liveCount = stores.filter((store) => store.status === 'Live').length;
    const mrr = stores.reduce((sum, store) => sum + store.mrr, 0);
    const pendingApprovals = approvals.filter((item) => item.status === 'Pending').length;
    const heldPayouts = stores.filter((store) => store.payout === 'Held').length;

    return {
      managedCount,
      liveCount,
      mrr,
      pendingApprovals,
      heldPayouts
    };
  }, [approvals, stores]);

  const userInitials = currentUser.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const addActivity = (message: string) => {
    setActivity((current) => [
      {
        id: Date.now(),
        message,
        time: 'Just now'
      },
      ...current
    ]);
  };

  const updateStore = (storeId: number, updater: (store: StoreRecord) => StoreRecord) => {
    setStores((current) => current.map((store) => (store.id === storeId ? updater(store) : store)));
  };

  const handleApprovalDecision = (approvalId: number, status: 'Approved' | 'Rejected') => {
    const item = approvals.find((approval) => approval.id === approvalId);
    if (!item) {
      return;
    }

    setApprovals((current) =>
      current.map((approval) =>
        approval.id === approvalId ? { ...approval, status } : approval
      )
    );
    setBanner(`${item.label} marked as ${status.toLowerCase()}.`);
    addActivity(`${item.label} for ${item.subject} was ${status.toLowerCase()} by Root Admin.`);
  };

  const handleReleaseHeldPayouts = () => {
    const affectedStores = stores.filter((store) => store.payout === 'Held');
    if (!affectedStores.length) {
      setBanner('There are no held payouts to release.');
      return;
    }

    setStores((current) =>
      current.map((store) =>
        store.payout === 'Held' ? { ...store, payout: 'Reviewing' } : store
      )
    );
    setBanner(`Moved ${affectedStores.length} held payout${affectedStores.length > 1 ? 's' : ''} to review.`);
    addActivity(`Root Admin released ${affectedStores.length} held payout${affectedStores.length > 1 ? 's' : ''} into review.`);
  };

  const handleApproveEnterpriseStore = () => {
    if (!selectedStore) {
      return;
    }

    updateStore(selectedStore.id, (store) => ({
      ...store,
      plan: 'Scale',
      verification: 'Verified',
      status: 'Live',
      payout: store.payout === 'Held' ? 'Reviewing' : store.payout,
      lastReview: '06 Apr 2026'
    }));
    setBanner(`${selectedStore.store} is now approved for enterprise operations.`);
    addActivity(`Enterprise approval granted to ${selectedStore.store}.`);
  };

  const handleToggleStoreStatus = () => {
    if (!selectedStore) {
      return;
    }

    const nextStatus = selectedStore.status === 'Live' ? 'Suspended' : 'Live';
    updateStore(selectedStore.id, (store) => ({
      ...store,
      status: nextStatus,
      lastReview: '06 Apr 2026'
    }));
    setBanner(`${selectedStore.store} is now ${nextStatus.toLowerCase()}.`);
    addActivity(`${selectedStore.store} status changed to ${nextStatus.toLowerCase()}.`);
  };

  const handleToggleVerification = () => {
    if (!selectedStore) {
      return;
    }

    const nextVerification =
      selectedStore.verification === 'Verified' ? 'Pending' : 'Verified';
    updateStore(selectedStore.id, (store) => ({
      ...store,
      verification: nextVerification,
      lastReview: '06 Apr 2026'
    }));
    setBanner(`${selectedStore.store} verification set to ${nextVerification.toLowerCase()}.`);
    addActivity(`${selectedStore.store} verification moved to ${nextVerification.toLowerCase()}.`);
  };

  const handlePromotePlan = () => {
    if (!selectedStore) {
      return;
    }

    const planOrder = ['Starter', 'Growth', 'Scale'];
    const currentIndex = planOrder.indexOf(selectedStore.plan);
    const nextPlan = planOrder[Math.min(currentIndex + 1, planOrder.length - 1)];

    updateStore(selectedStore.id, (store) => ({
      ...store,
      plan: nextPlan,
      lastReview: '06 Apr 2026'
    }));
    setBanner(`${selectedStore.store} moved to the ${nextPlan} plan.`);
    addActivity(`${selectedStore.store} was promoted to the ${nextPlan} plan.`);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_rgba(15,23,42,1)_0%,_rgba(30,41,59,0.96)_18%,_rgba(248,250,252,1)_18%,_rgba(248,250,252,1)_100%)]">
      <header className="px-6 py-5 text-slate-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-400 p-2 text-slate-950 shadow-lg shadow-amber-400/20">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">FEZZY Root Admin</h1>
              <p className="text-xs text-slate-300">
                Store governance, payouts, and platform approvals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-slate-200 hover:bg-white/10 hover:text-white"
              onClick={() => navigate('admin')}
            >
              Open Admin Console
            </Button>
            <Button
              variant="ghost"
              className="text-slate-200 hover:bg-white/10 hover:text-white"
              onClick={() => navigate('landing')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Exit
            </Button>
            <button
              type="button"
              onClick={onLogout}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold"
            >
              {userInitials}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 pb-8">
        <AnimatePresence>
          {banner && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
            >
              {banner}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-32 animate-pulse rounded-2xl bg-white/80"
                  />
                ))}
              </div>
              <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                <div className="h-[540px] animate-pulse rounded-3xl bg-white/80" />
                <div className="space-y-6">
                  <div className="h-[300px] animate-pulse rounded-3xl bg-white/80" />
                  <div className="h-[260px] animate-pulse rounded-3xl bg-slate-800/70" />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="loaded"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <RootMetric
                  title="Managed Stores"
                  value={String(metrics.managedCount)}
                  note={`${metrics.liveCount} currently live`}
                  icon={<Store className="h-4 w-4 text-primary" />}
                />
                <RootMetric
                  title="Platform MRR"
                  value={formatCurrency(metrics.mrr)}
                  note="Across owner-managed accounts"
                  icon={<DollarSign className="h-4 w-4 text-emerald-500" />}
                />
                <RootMetric
                  title="Pending Approvals"
                  value={String(metrics.pendingApprovals)}
                  note="Awaiting owner action"
                  icon={<ShieldCheck className="h-4 w-4 text-amber-500" />}
                />
                <RootMetric
                  title="Held Payouts"
                  value={String(metrics.heldPayouts)}
                  note="Ready for release or review"
                  icon={<UserCog className="h-4 w-4 text-sky-500" />}
                />
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                <motion.div whileHover={{ y: -2 }}>
                  <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/70">
                    <CardHeader className="border-b border-border bg-background/90">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                          <div>
                            <CardTitle>Store control center</CardTitle>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Search stores, filter risk, and select one to manage.
                            </p>
                          </div>
                          <div className="relative w-full lg:w-80">
                            <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              className="pl-9"
                              placeholder="Search store, owner, domain"
                            />
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <label className="space-y-2 text-sm">
                            <span className="font-medium text-foreground">Region</span>
                            <select
                              value={regionFilter}
                              onChange={(e) => setRegionFilter(e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                              {regions.map((region) => (
                                <option key={region} value={region}>
                                  {region}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="space-y-2 text-sm">
                            <span className="font-medium text-foreground">Status</span>
                            <select
                              value={statusFilter}
                              onChange={(e) => setStatusFilter(e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                              {['All Statuses', 'Live', 'Suspended'].map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="grid gap-6 pt-6 lg:grid-cols-[1.05fr_0.95fr]">
                      <div className="overflow-x-auto rounded-3xl border border-border">
                        <table className="w-full min-w-[720px] text-left text-sm">
                          <thead className="bg-muted/50 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                            <tr>
                              <th className="px-4 py-3 font-medium">Store</th>
                              <th className="px-4 py-3 font-medium">Owner</th>
                              <th className="px-4 py-3 font-medium">Plan</th>
                              <th className="px-4 py-3 font-medium">Payout</th>
                              <th className="px-4 py-3 font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {filteredStores.map((store) => (
                              <motion.tr
                                key={store.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={() => setSelectedStoreId(store.id)}
                                className={`cursor-pointer bg-background transition-colors hover:bg-muted/20 ${
                                  selectedStore?.id === store.id ? 'bg-amber-50' : ''
                                }`}
                              >
                                <td className="px-4 py-4">
                                  <p className="font-semibold text-foreground">{store.store}</p>
                                  <p className="mt-1 text-xs text-muted-foreground">{store.domain}</p>
                                </td>
                                <td className="px-4 py-4">{store.owner}</td>
                                <td className="px-4 py-4">
                                  <Badge variant="outline">{store.plan}</Badge>
                                </td>
                                <td className="px-4 py-4">
                                  <Badge variant={getPayoutBadge(store.payout)}>{store.payout}</Badge>
                                </td>
                                <td className="px-4 py-4">
                                  <Badge variant={store.status === 'Live' ? 'success' : 'destructive'}>
                                    {store.status}
                                  </Badge>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <Card className="border border-border shadow-none">
                        <CardHeader>
                          <CardTitle className="text-xl">Selected store</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                          {selectedStore ? (
                            <>
                              <div>
                                <p className="text-lg font-semibold text-foreground">
                                  {selectedStore.store}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedStore.owner} · {selectedStore.region}
                                </p>
                              </div>

                              <div className="grid gap-3 sm:grid-cols-2">
                                <DetailItem label="Domain" value={selectedStore.domain} />
                                <DetailItem
                                  label="MRR"
                                  value={formatCurrency(selectedStore.mrr)}
                                />
                                <DetailItem label="Plan" value={selectedStore.plan} />
                                <DetailItem label="Last Review" value={selectedStore.lastReview} />
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <Badge variant={selectedStore.status === 'Live' ? 'success' : 'destructive'}>
                                  {selectedStore.status}
                                </Badge>
                                <Badge variant={selectedStore.verification === 'Verified' ? 'success' : 'warning'}>
                                  {selectedStore.verification}
                                </Badge>
                                <Badge variant={selectedStore.riskLevel === 'High' ? 'destructive' : selectedStore.riskLevel === 'Medium' ? 'warning' : 'success'}>
                                  {selectedStore.riskLevel} Risk
                                </Badge>
                              </div>

                              <div className="grid gap-3">
                                <Button
                                  className="w-full justify-start bg-white text-slate-950 hover:bg-slate-100"
                                  onClick={handleApproveEnterpriseStore}
                                >
                                  <Building2 className="mr-2 h-4 w-4" />
                                  Approve enterprise access
                                </Button>
                                <Button
                                  className="w-full justify-start"
                                  variant="secondary"
                                  onClick={handlePromotePlan}
                                >
                                  <Wallet className="mr-2 h-4 w-4" />
                                  Promote store plan
                                </Button>
                                <Button
                                  className="w-full justify-start"
                                  variant="outline"
                                  onClick={handleToggleVerification}
                                >
                                  <ShieldCheck className="mr-2 h-4 w-4" />
                                  Toggle verification
                                </Button>
                                <Button
                                  className="w-full justify-start"
                                  variant={selectedStore.status === 'Live' ? 'destructive' : 'default'}
                                  onClick={handleToggleStoreStatus}
                                >
                                  {selectedStore.status === 'Live' ? (
                                    <XCircle className="mr-2 h-4 w-4" />
                                  ) : (
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                  )}
                                  {selectedStore.status === 'Live' ? 'Suspend store' : 'Reactivate store'}
                                </Button>
                              </div>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Select a store to open management controls.
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </CardContent>
                  </Card>
                </motion.div>

                <div className="space-y-6">
                  <motion.div whileHover={{ y: -2 }}>
                    <Card className="border-none shadow-xl shadow-slate-200/70">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Executive approvals</CardTitle>
                        <Badge variant="warning">
                          {metrics.pendingApprovals} pending
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {approvals.map((approval) => (
                          <motion.div
                            key={approval.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-3xl border border-border bg-muted/20 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-foreground">
                                  {approval.label}
                                </p>
                                <p className="mt-2 text-sm font-medium text-foreground">
                                  {approval.subject}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  approval.status === 'Approved'
                                    ? 'success'
                                    : approval.status === 'Rejected'
                                      ? 'destructive'
                                      : approval.priority === 'High'
                                        ? 'warning'
                                        : 'outline'
                                }
                              >
                                {approval.status}
                              </Badge>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                              {approval.detail}
                            </p>
                            {approval.status === 'Pending' && (
                              <div className="mt-4 flex gap-2">
                                <Button
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleApprovalDecision(approval.id, 'Approved')}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => handleApprovalDecision(approval.id, 'Rejected')}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div whileHover={{ y: -2 }}>
                    <Card className="border-none bg-slate-950 text-slate-50 shadow-xl shadow-slate-300/50">
                      <CardHeader>
                        <CardTitle>Root controls</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button
                          className="w-full justify-start bg-white text-slate-950 hover:bg-slate-100"
                          onClick={handleApproveEnterpriseStore}
                        >
                          <Building2 className="mr-2 h-4 w-4" />
                          Approve selected store
                        </Button>
                        <Button
                          className="w-full justify-start"
                          variant="secondary"
                          onClick={handleReleaseHeldPayouts}
                        >
                          <Wallet className="mr-2 h-4 w-4" />
                          Release held payouts
                        </Button>
                        <Button
                          className="w-full justify-start"
                          variant="outline"
                          onClick={() => {
                            setBanner('Admin permission review queued for operations leadership.');
                            addActivity('Root Admin queued a permission audit for platform admins.');
                          }}
                        >
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Review admin permissions
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div whileHover={{ y: -2 }}>
                    <Card className="border-none shadow-xl shadow-slate-200/70">
                      <CardHeader>
                        <CardTitle>Activity trail</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {activity.map((entry) => (
                          <div key={entry.id} className="rounded-2xl border border-border bg-background p-4">
                            <p className="text-sm text-foreground">{entry.message}</p>
                            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                              {entry.time}
                            </p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function RootMetric({
  title,
  value,
  note,
  icon
}: {
  title: string;
  value: string;
  note: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div whileHover={{ y: -3 }}>
      <Card className="border-none shadow-lg shadow-slate-200/70">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{value}</div>
          <p className="mt-1 text-sm text-muted-foreground">{note}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/20 p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function getPayoutBadge(payout: StoreRecord['payout']) {
  if (payout === 'Held') {
    return 'destructive' as const;
  }

  if (payout === 'Reviewing') {
    return 'warning' as const;
  }

  return 'success' as const;
}

function formatCurrency(value: number) {
  return `KES ${value.toLocaleString()}`;
}
