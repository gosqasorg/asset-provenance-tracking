#!/usr/bin/env node

let group = await fetch('http://localhost:7071/api/createGroup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    provenanceRecord: {
      deviceName: 'Group Title',
      description: 'Group Description',
      number_of_children: 5,
      children_name: ['Child1', 'Child2', 'Child3', 'Child4', 'Child5'],
      tags: ['tag1', 'tag2'],
      hasPublicKey: true
    }
  })
})

console.log(group)
console.log('groupUrl' in group)

const formData = new FormData()
formData.append('provenanceRecord', '{"deviceName":"Group Title","description":"Group Description","number_of_children":5,"children_name":["Child1","Child2","Child3","Child4","Child5"],"tags":["tag1","tag2"],"hasPublicKey":true}')

let foo = await fetch('http://localhost:7071/api/createGroup', {
  method: 'POST',
  body: formData
})

console.log(foo)
console.log('groupUrl' in foo)
