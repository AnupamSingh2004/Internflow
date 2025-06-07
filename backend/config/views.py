# your_app/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from rest_framework.permissions import AllowAny
from .parser import parse_resume # Import your parser function

class ResumeParseView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        if 'resume' not in request.FILES:
            return Response(
                {"error": "No resume file provided"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        resume_file = request.FILES['resume']

        try:
            parsed_data = parse_resume(resume_file)
            return Response(parsed_data, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Generic error for unexpected issues during parsing
            return Response(
                {"error": "An error occurred during parsing.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )