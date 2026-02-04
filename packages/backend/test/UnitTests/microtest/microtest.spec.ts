import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as httpTrigger from '../../../src/functions/httpTrigger';

describe('NotificationSignUpTags', () => {
  it('get response for vaidateNotifications', async () => {

    const testData = {
      noTagsMeansAllUpdates : [],

    }
    let response = httpTrigger.validateNotification(testData) 
    console.log(response)
    expect(response).toBe(true)


  });
  
//cre
// notes from vincent 
  // we 

  // currently working on test
  //test 1
  // check with all the correct format
  //test 2
  //check with missing tag selection
  //test 3
  // is values are not arrays 
  //test 4
  //check if array contains numbers or some other weird stuff

});