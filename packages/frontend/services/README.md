# Overview of Offline Mode

We’ve implemented our offline mode by having a worker constantly running in the background of our site. Every 5 seconds it checks if the queue stash (where we store records created offline) is empty. If it’s not, the worker then checks if we’re online by attempting to create the stashed record. If the post request fails offline we go back to waiting, otherwise we move the request to either the failed or fulfilled stash.

postProvenance adds records that fail to create while offline to the queue stash for our worker to create later. Below is a visual version of our postProvenance function and worker to better visualize how it works.

![postProvenance Diagram](offline_postProvenance.png)
![Offline Worker Diagram](offline_worker.png)

## localStorage

localStorage is a way for us to store data that persists between pages/instances of the site. Here we store all of the records created offline in three stashes:
- queue stash (gdt-stash-queue): stores records to create once back online (FIFO, we added new records to the end of the stash and remove from the beginning)
queue stash layout: [{“key”: key, “data”: formData}, {“key”: key2, “data”: formData2}, ...]

- fulfilled stash: (gdt-stash-fulfilled): stores records successfully created from the queue
fulfilled stash layout: [key, key2, …]

- failed stash: (gdt-stash-failed): stores records that failed to create from the queue
failed stash layout: [{“key”: key, “data”: formData}, {“key”: key2, “data”: formData2}, ...]

We have a few other variables that we store in localStorage as well:
- workerIsActive: a boolean that tells us whether or not a worker is already running (this is to prevent multiple workers running on the same device)

## Functions for Offline Mode

Offline mode has a few functions that allow it to work:
- offlineQueueConsumerWorker: Our worker function, constantly running in the background to try and create records from the queue
- stashOfflineRequest/removeOfflineRequest: add/remove requests from all 3 stashes
- getFirstQueueItem/removeFirstQueueItem: add/remove _first_ request from all 3 stashes
- confirmRequestFulfilled: call get request on new item to confirm it exists
- displayInSnackbar: display success snackbar to the frontend