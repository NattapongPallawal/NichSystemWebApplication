/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SystemDataService } from './system-data.service';

describe('Service: SystemData', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SystemDataService]
    });
  });

  it('should ...', inject([SystemDataService], (service: SystemDataService) => {
    expect(service).toBeTruthy();
  }));
});
