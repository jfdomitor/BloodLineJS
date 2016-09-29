var json_example_data =
[
    {
        "ID": "ID1",
        "FullName": "Barack Hussein Obama",
        "FirstName": "Barack",
        "LastName": "Obama",
        "BirthDate": "Apr 4, 1936",
        "Gender": "M",
        "Relatives": [
      {
          "Type": "CHILD",
          "ID": "ID3"
      },
      {
          "Type": "WIFE",
          "ID": "ID2"
      }
        ]
    },
    {
        "ID": "ID2",
        "FullName": "Stanley Ann Dunham",
        "FirstName": "Ann",
        "LastName": "Dunham",
        "BirthDate": "Nov 29 1942",
        "Gender": "F",
        "Relatives": [
      {
          "Type": "CHILD",
          "ID": "ID3"
      },
      {
          "Type": "HUSB",
          "ID": "ID1"
      }
        ]
    },
    {
        "ID": "ID3",
        "FullName": "Barack H Obama",
        "FirstName": "Barack",
        "LastName": "Obama",
        "BirthDate": "Aug 4 1961",
        "Gender": "M",
        "Relatives": [
      {
          "Type": "MOTHER",
          "ID": "ID2"
      },
      {
          "Type": "FATHER",
          "ID": "ID1"
      },
       {
           "Type": "WIFE",
           "ID": "ID4"
       },
        {
            "Type": "CHILD",
            "ID": "ID5"
        },
        {
            "Type": "CHILD",
            "ID": "ID6"
        }
        ]
    },
     {
         "ID": "ID4",
         "FullName": "Michelle Obama",
         "FirstName": "Michelle",
         "LastName": "Obama",
         "BirthDate": "Jan 17 1964",
         "Gender": "F",
         "Relatives": [
       {
           "Type": "HUSB",
           "ID": "ID3"
       },
       {
           "Type": "CHILD",
           "ID": "ID5"
       },
        {
            "Type": "CHILD",
            "ID": "ID6"
        }
         ]
     },
     {
         "ID": "ID5",
         "FullName": "Malia Obama",
         "FirstName": "Malia",
         "LastName": "Obama",
         "BirthDate": "JUL 4 1998",
         "Gender": "F",
         "Relatives": [
       {
           "Type": "MOTHER",
           "ID": "ID4"
       },
       {
           "Type": "FATHER",
           "ID": "ID3"
       }
         ]
     },
     {
         "ID": "ID6",
         "FullName": "Sasha Obama",
         "FirstName": "Sasha",
         "LastName": "Obama",
         "BirthDate": "Jun 10 2001",
         "Gender": "F",
         "Relatives": [
       {
           "Type": "MOTHER",
           "ID": "ID4"
       },
       {
           "Type": "FATHER",
           "ID": "ID3"
       }
         ]
     }];