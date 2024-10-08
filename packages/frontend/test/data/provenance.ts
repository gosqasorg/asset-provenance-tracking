// Example of real data
export const fakeProvenanceNoChildren = [
    {
        "record": {
            "description": "Distributed to user.",
            "tags": [
                "distribution",
            ],
            "children_key": [],
            "children_name": [],
            "warnings": [],
            "isRecall": false
        },
        "attachments": [
            "9s8d7f98sfd"
        ],
        "deviceID": "abc123",
        "timestamp": 1720000000005
    },
    {
        "record": {
            "description": "Training session",
            "tags": [
                "training",
                "customer"
            ],
            "children_key": [],
            "children_name": [],
            "warnings": [],
            "isRecall": false
        },
        "attachments": [
            "9s8d7f98sfd"
        ],
        "deviceID": "abc123",
        "timestamp": 1720000000004
    },
    {
        "record": {
            "description": "Reading for shipping.",
            "tags": []
        },
        "attachments": [],
        "deviceID": "abc123",
        "timestamp": 1720000000003
    },
    {
        "record": {
            "description": "Quality Assurance",
            "tags": [
                "qa"
            ]
        },
        "attachments": [],
        "deviceID": "abc123",
        "timestamp": 1720000000002
    },
    {
        "record": {
            "description": "Some description",
            "name": "Some name",
            "tags": [
                "created"
            ],
            "deviceName": "Some deviceName"
        },
        "attachments": [],
        "deviceID": "abc123",
        "timestamp": 1720000000001
    }
]

// Example of real data
export const fakeProvenanceWithChildren = [
    {
        "record": {
            "description": "Distributed to user.",
            "tags": [
                "distribution",
            ],
            "children_key": ["childkey1"],
            "children_name": ["xyz"],
            "warnings": [],
            "isRecall": false
        },
        "attachments": [
            "9s8d7f98sfd"
        ],
        "deviceID": "abc123",
        "timestamp": 1720000000005
    },
    {
        "record": {
            "description": "Training session",
            "tags": [
                "training",
                "customer"
            ],
            "children_key": ["childkey2", "childkey3"],
            "children_name": ["abc", "def"],
            "warnings": [],
            "isRecall": false
        },
        "attachments": [
            "9s8d7f98sfd"
        ],
        "deviceID": "abc123",
        "timestamp": 1720000000004
    },
    {
        "record": {
            "description": "Reading for shipping.",
            "tags": []
        },
        "attachments": [],
        "deviceID": "abc123",
        "timestamp": 1720000000003
    },
    {
        "record": {
            "description": "Quality Assurance",
            "tags": [
                "qa"
            ]
        },
        "attachments": [],
        "deviceID": "abc123",
        "timestamp": 1720000000002
    },
    {
        "record": {
            "description": "Some description",
            "name": "Some name",
            "tags": [
                "created"
            ],
            "deviceName": "Some deviceName"
        },
        "attachments": [],
        "deviceID": "abc123",
        "timestamp": 1720000000001
    }
]
