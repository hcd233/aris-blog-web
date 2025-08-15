'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { 
  History, 
  Eye, 
  Copy, 
  MoreHorizontal, 
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react';
import { ArticleVersion } from '@/types/dto';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ArticleVersionsProps {
  versions: ArticleVersion[];
  currentVersion?: ArticleVersion;
  isLoading?: boolean;
  onViewVersion?: (version: ArticleVersion) => void;
  onRestoreVersion?: (version: ArticleVersion) => void;
  onCompareVersions?: (version1: ArticleVersion, version2: ArticleVersion) => void;
  className?: string;
}

const VersionCard: React.FC<{
  version: ArticleVersion;
  isCurrent?: boolean;
  onView?: (version: ArticleVersion) => void;
  onRestore?: (version: ArticleVersion) => void;
  onCompare?: (version: ArticleVersion) => void;
}> = ({ version, isCurrent, onView, onRestore, onCompare }) => {
  const [showContent, setShowContent] = useState(false);

  return (
    <Card className={cn(
      "hover:shadow-md transition-shadow",
      isCurrent && "ring-2 ring-primary"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">
                版本 v{version.version}
              </CardTitle>
              {isCurrent && (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  当前版本
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(new Date(version.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {version.content.length} 字符
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(version)}>
                <Eye className="w-4 h-4 mr-2" />
                查看内容
              </DropdownMenuItem>
              {!isCurrent && (
                <DropdownMenuItem onClick={() => onRestore?.(version)}>
                  <Copy className="w-4 h-4 mr-2" />
                  恢复此版本
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onCompare?.(version)}>
                <History className="w-4 h-4 mr-2" />
                与当前版本比较
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowContent(!showContent)}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {showContent ? '隐藏内容' : '预览内容'}
            </Button>
          </div>
          
          {showContent && (
            <div className="bg-muted p-3 rounded-md">
              <div className="text-sm text-muted-foreground mb-2">内容预览：</div>
              <div className="text-sm line-clamp-4">
                {version.content.substring(0, 200)}
                {version.content.length > 200 && '...'}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const VersionComparison: React.FC<{
  version1: ArticleVersion;
  version2: ArticleVersion;
  onClose: () => void;
}> = ({ version1, version2, onClose }) => {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>版本比较</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3">版本 v{version1.version}</h3>
            <div className="bg-muted p-4 rounded-md">
              <pre className="text-sm whitespace-pre-wrap">{version1.content}</pre>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">版本 v{version2.version}</h3>
            <div className="bg-muted p-4 rounded-md">
              <pre className="text-sm whitespace-pre-wrap">{version2.content}</pre>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ArticleVersionsSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="h-6 w-32 mb-2" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const ArticleVersions: React.FC<ArticleVersionsProps> = ({
  versions,
  currentVersion,
  isLoading = false,
  onViewVersion,
  onRestoreVersion,
  onCompareVersions,
  className,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<ArticleVersion | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [compareVersion, setCompareVersion] = useState<ArticleVersion | null>(null);

  const handleViewVersion = (version: ArticleVersion) => {
    setSelectedVersion(version);
    onViewVersion?.(version);
  };

  const handleRestoreVersion = (version: ArticleVersion) => {
    onRestoreVersion?.(version);
  };

  const handleCompareVersion = (version: ArticleVersion) => {
    if (currentVersion) {
      setCompareVersion(version);
      setShowComparison(true);
    }
    onCompareVersions?.(version, currentVersion!);
  };

  if (isLoading) {
    return <ArticleVersionsSkeleton />;
  }

  if (versions.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 mx-auto">
          <History className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">暂无版本历史</h3>
        <p className="text-muted-foreground">还没有创建任何版本</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* 版本列表 */}
      {versions.map((version) => (
        <VersionCard
          key={version.versionID}
          version={version}
          isCurrent={currentVersion?.versionID === version.versionID}
          onView={handleViewVersion}
          onRestore={handleRestoreVersion}
          onCompare={handleCompareVersion}
        />
      ))}

      {/* 版本详情对话框 */}
      <Dialog open={!!selectedVersion} onOpenChange={() => setSelectedVersion(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>版本 v{selectedVersion?.version} 详情</DialogTitle>
          </DialogHeader>
          
          {selectedVersion && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div>创建时间: {format(new Date(selectedVersion.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}</div>
                <div>更新时间: {format(new Date(selectedVersion.updatedAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}</div>
                <div>内容长度: {selectedVersion.content.length} 字符</div>
              </div>
              
              <div className="bg-muted p-4 rounded-md">
                <pre className="text-sm whitespace-pre-wrap">{selectedVersion.content}</pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 版本比较对话框 */}
      {showComparison && compareVersion && currentVersion && (
        <VersionComparison
          version1={compareVersion}
          version2={currentVersion}
          onClose={() => {
            setShowComparison(false);
            setCompareVersion(null);
          }}
        />
      )}
    </div>
  );
};