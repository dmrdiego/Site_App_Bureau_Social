import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import type { Quota } from "@shared/schema";

export default function Quotas() {
    const { t } = useTranslation();
    const { isAuthenticated } = useAuth();

    const { data: quotas, isLoading } = useQuery<Quota[]>({
        queryKey: ["/api/quotas"],
        enabled: isAuthenticated,
    });

    if (isLoading) {
        return <QuotasSkeleton />;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{t('quotas.title')}</h1>
                <p className="text-muted-foreground">
                    {t('quotas.subtitle')}
                </p>
            </div>

            <div className="grid gap-4">
                {quotas && quotas.length > 0 ? (
                    quotas.map((quota) => (
                        <QuotaCard key={quota.id} quota={quota} />
                    ))
                ) : (
                    <Card>
                        <CardContent className="text-center py-16">
                            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">
                                {t('quotas.noQuotas')}
                            </h3>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

function QuotaCard({ quota }: { quota: Quota }) {
    const { t, i18n } = useTranslation();
    const locale = i18n.language === 'en' ? 'en-US' : 'pt-PT';

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pago':
                return {
                    label: t('quotas.paid'),
                    variant: "default" as const,
                    icon: CheckCircle2,
                    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
                };
            case 'atrasado':
                return {
                    label: t('quotas.overdue'),
                    variant: "destructive" as const,
                    icon: AlertCircle,
                    className: "",
                };
            default:
                return {
                    label: t('quotas.pending'),
                    variant: "secondary" as const,
                    icon: Clock,
                    className: "",
                };
        }
    };

    const config = getStatusConfig(quota.status || 'pendente');
    const StatusIcon = config.icon;

    return (
        <Card className="hover-elevate transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold">
                    {t('quotas.year')} {quota.year}
                </CardTitle>
                <Badge variant={config.variant} className={config.className}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {config.label}
                </Badge>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('quotas.amount')}</p>
                        <p className="text-2xl font-bold text-primary">{quota.amount}€</p>
                    </div>
                    {quota.paidAt && (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{t('quotas.paidAt')}</p>
                            <p className="text-lg">
                                {new Date(quota.paidAt).toLocaleDateString(locale)}
                            </p>
                        </div>
                    )}
                    {quota.paymentMethod && (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{t('quotas.method')}</p>
                            <p className="text-lg capitalize">{quota.paymentMethod}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function QuotasSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2].map((i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
