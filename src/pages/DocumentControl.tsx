import React, { useState, useEffect } from 'react';
import { Policy, PolicyDocument } from '@/types/policy';
import { getPolicies } from '@/data/policies';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { FileText, History, Download } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface AggregatedDocument extends PolicyDocument {
  policyNumber: string;
}

const VersionHistory: React.FC<{ versions: any[] }> = ({ versions }) => {
  return (
    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
        <h4 className="font-semibold mb-2 text-sm">Historial de Versiones</h4>
        <ul className="space-y-1">
            {versions.sort((a, b) => b.version - a.version).map(v => (
                <li key={v.version} className="flex justify-between items-center text-xs p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                    <div>
                        <span className="font-medium">v{v.version}:</span> {v.fileName}
                        <span className="text-gray-500 dark:text-gray-400 ml-2">({format(new Date(v.uploadedAt), 'dd/MM/yy HH:mm')})</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Download className="h-3 w-3" />
                    </Button>
                </li>
            ))}
        </ul>
    </div>
  )
}

export const DocumentControl = () => {
  const [allDocuments, setAllDocuments] = useState<AggregatedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllDocuments = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const policies = await getPolicies();
            const docs: AggregatedDocument[] = [];
            policies.forEach((policy: Policy) => {
                policy.documents.forEach((doc: PolicyDocument) => {
                    docs.push({
                    ...doc,
                    policyNumber: policy.policyNumber,
                    });
                });
            });
            setAllDocuments(docs);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    fetchAllDocuments();
  }, []);

  const toggleVersionHistory = (docId: string) => {
    setExpandedDoc(prev => (prev === docId ? null : docId));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Control Central de Documentos</h1>
      
      {isLoading ? <LoadingSpinner /> : error ? <div className="text-red-500 text-center">{error}</div> : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Póliza</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Última Versión</TableHead>
                <TableHead className="text-right">Versiones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allDocuments.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">No hay documentos cargados en el sistema.</TableCell>
                  </TableRow>
              ) : allDocuments.map((doc: AggregatedDocument) => {
                  const latestVersion = doc.versions.sort((a,b) => b.version - a.version)[0];
                  return (
                      <React.Fragment key={doc.id}>
                          <TableRow>
                              <TableCell><FileText className="w-5 h-5 text-gray-400" /></TableCell>
                              <TableCell className="font-medium">{doc.title}</TableCell>
                              <TableCell>
                                  <Badge variant="outline">{doc.policyNumber}</Badge>
                              </TableCell>
                              <TableCell>{doc.role}</TableCell>
                              <TableCell>
                                  {latestVersion ? `v${latestVersion.version} - ${latestVersion.fileName}` : 'N/A'}
                              </TableCell>
                              <TableCell className="text-right">
                                  <Button variant="ghost" size="sm" onClick={() => toggleVersionHistory(doc.id)}>
                                      <History className="w-4 h-4 mr-2" />
                                      {doc.versions.length}
                                  </Button>
                              </TableCell>
                          </TableRow>
                          {expandedDoc === doc.id && (
                              <TableRow>
                                  <TableCell colSpan={6}>
                                      <VersionHistory versions={doc.versions} />
                                  </TableCell>
                              </TableRow>
                          )}
                      </React.Fragment>
                  )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default DocumentControl; 