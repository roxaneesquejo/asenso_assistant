
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Image from 'next/image';

type SubmissionPreviewProps = {
  idPhotoDataUris: string[];
  documentDataUris: string[];
};

export function SubmissionPreview({ idPhotoDataUris, documentDataUris }: SubmissionPreviewProps) {
  const hasIdPhotos = idPhotoDataUris.length > 0;
  const hasDocuments = documentDataUris.length > 0;

  if (!hasIdPhotos && !hasDocuments) {
    return null;
  }

  const isPdf = (uri: string) => uri.startsWith('data:application/pdf');
  const isImage = (uri: string) => uri.startsWith('data:image');
  const isDoc = (uri: string) => uri.startsWith('data:application/msword') || uri.startsWith('data:application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  
  return (
    <Card className="w-full mt-4">
      <CardHeader>
        <CardTitle>Submission Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={['id-photos', 'documents']}>
          {hasIdPhotos && (
            <AccordionItem value="id-photos">
              <AccordionTrigger>ID Photo(s) ({idPhotoDataUris.length})</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-4">
                  {idPhotoDataUris.map((uri, index) => (
                    <div key={`id-${index}`} className="relative aspect-video">
                        <Image src={uri} alt={`ID Photo ${index + 1}`} layout="fill" objectFit="contain" className="rounded-md border" />
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {hasDocuments && (
            <AccordionItem value="documents">
              <AccordionTrigger>Supporting Document(s) ({documentDataUris.length})</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {documentDataUris.map((uri, index) => (
                    <div key={`doc-${index}`}>
                      {isImage(uri) && (
                         <div className="relative aspect-video">
                            <Image src={uri} alt={`Document ${index + 1}`} layout="fill" objectFit="contain" className="rounded-md border" />
                        </div>
                      )}
                       {isPdf(uri) && (
                        <div className="p-4 border rounded-md text-center">
                          <a href={uri} download={`document-${index+1}.pdf`} className="text-primary hover:underline">
                            Download PDF Document {index + 1}
                          </a>
                        </div>
                      )}
                      {isDoc(uri) && (
                        <div className="p-4 border rounded-md text-center">
                          <a href={uri} download={`document-${index+1}.docx`} className="text-primary hover:underline">
                            Download Word Document {index + 1}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
}
