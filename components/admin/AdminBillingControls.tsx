<div>
                  <label className="text-sm font-medium">Amount</label>
                  <p className="text-lg font-semibold">${selectedInvoice.amount.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Created</label>
                  <p>{selectedInvoice.createdAt.toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <p>{selectedInvoice.dueDate.toLocaleDateString()}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <p>{selectedInvoice.description}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowInvoiceDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}