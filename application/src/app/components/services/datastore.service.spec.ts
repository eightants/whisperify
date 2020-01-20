import { TestBed } from '@angular/core/testing';

import { DatastoreService } from './datastore.service';

describe('DatastoreService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DatastoreService = TestBed.get(DatastoreService);
    expect(service).toBeTruthy();
  });
});
