import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ClientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: { id: string; name: string; email: string; phone: string }[];
}

const ClientsModal: React.FC<ClientsModalProps> = ({ isOpen, onClose, clients }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Clients List</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2 max-h-96 overflow-y-auto">
          {clients.map((client) => (
            <div
              key={client.id}
              className="flex items-center justify-between p-4 border rounded-lg bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col">
                <p className="font-medium text-lg">{client.name}</p>
                <p className="text-sm text-muted-foreground">{client.email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{client.phone}</p>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClientsModal;
